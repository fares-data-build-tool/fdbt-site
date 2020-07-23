import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import { ServerResponse } from 'http';
import { Request, Response } from 'express';
import { decode } from 'jsonwebtoken';
import { putStringInS3, getCsvZoneUploadData } from '../../../data/s3';
import {
    OPERATOR_COOKIE,
    FARE_TYPE_COOKIE,
    ID_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    MATCHING_DATA_BUCKET_NAME,
    PASSENGER_TYPE_COOKIE,
    MATCHING_ATTRIBUTE,
    INBOUND_MATCHING_ATTRIBUTE,
    PERIOD_EXPIRY_ATTRIBUTE,
    CSV_ZONE_UPLOAD_COOKIE,
    SERVICE_LIST_COOKIE,
    PRODUCT_DETAILS_ATTRIBUTE,
    PERIOD_TYPE_COOKIE,
} from '../../../constants';
import {
    CognitoIdToken,
    ErrorInfo,
    SalesOfferPackage,
    NextApiRequestWithSession,
    SingleTicket,
    ReturnTicket,
    PeriodGeoZoneTicket,
    PeriodMultipleServicesTicket,
    FlatFareTicket,
    Stop,
    SelectedService,
    ProductData,
    PeriodExpiryWithErrors,
    ProductInfo,
    ProductDetails,
    Product,
    FlatFareProductDetails,
} from '../../../interfaces';
import { globalSignOut } from '../../../data/cognito';
import { MatchingInfo, MatchingWithErrors, InboundMatchingInfo } from '../../../interfaces/matchingInterface';
import { getSessionAttribute } from '../../../utils/sessions';
import { getFareZones } from './matching';
import { batchGetStopsByAtcoCode } from '../../../data/auroradb';

type Req = NextApiRequest | Request;
type Res = NextApiResponse | Response;

export const setCookieOnResponseObject = (cookieName: string, cookieValue: string, req: Req, res: Res): void => {
    const cookies = new Cookies(req, res);
    // From docs: All cookies are httponly by default, and cookies sent over SSL are secure by
    // default. An error will be thrown if you try to send secure cookies over an insecure socket.
    cookies.set(cookieName, cookieValue, {
        path: '/',
        // The Cookies library applies units of Milliseconds to maxAge. For this reason, maxAge of 24 hours needs to be corrected by a factor of 1000.
        maxAge: 1000 * (3600 * 24),
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== 'development',
    });
};

export const deleteCookieOnResponseObject = (cookieName: string, req: Req, res: Res): void => {
    const cookies = new Cookies(req, res);

    cookies.set(cookieName, '', { overwrite: true, maxAge: 0, path: '/' });
};

export const unescapeAndDecodeCookie = (cookies: Cookies, cookieToDecode: string): string => {
    return unescape(decodeURI(cookies.get(cookieToDecode) || ''));
};

export const getUuidFromCookie = (req: NextApiRequest | Request, res: NextApiResponse | Response): string => {
    const cookies = new Cookies(req, res);
    const operatorCookie = unescapeAndDecodeCookie(cookies, OPERATOR_COOKIE);

    return operatorCookie ? JSON.parse(operatorCookie).uuid : '';
};

export const redirectTo = (res: NextApiResponse | ServerResponse, location: string): void => {
    res.writeHead(302, {
        Location: location,
    });
    res.end();
};

export const redirectToError = (res: NextApiResponse | ServerResponse, message: string, error: Error): void => {
    console.error(message, error.stack);
    redirectTo(res, '/error');
};

export const redirectOnFareType = (req: NextApiRequest, res: NextApiResponse): void => {
    const cookies = new Cookies(req, res);
    const fareTypeCookie = unescapeAndDecodeCookie(cookies, FARE_TYPE_COOKIE);
    const { fareType } = JSON.parse(fareTypeCookie);

    if (fareType) {
        switch (fareType) {
            case 'period':
                redirectTo(res, '/periodType');
                return;
            case 'single':
                redirectTo(res, '/service');
                return;
            case 'return':
                redirectTo(res, '/service');
                return;
            case 'flatFare':
                redirectTo(res, '/serviceList');
                return;
            default:
                throw new Error('Fare Type we expect was not received.');
        }
    } else {
        throw new Error('Could not extract fareType from the FARE_TYPE_COOKIE.');
    }
};

export const checkEmailValid = (email: string): boolean => {
    const emailRegex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    return emailRegex.test(email) && email !== '';
};

export const getAttributeFromIdToken = <T extends keyof CognitoIdToken>(
    req: NextApiRequest,
    res: NextApiResponse,
    attribute: T,
): CognitoIdToken[T] | null => {
    const cookies = new Cookies(req, res);
    const idToken = cookies.get(ID_TOKEN_COOKIE);

    if (!idToken) {
        return null;
    }

    const decodedIdToken = decode(idToken) as CognitoIdToken;

    return decodedIdToken[attribute] ?? null;
};

export const getNocFromIdToken = (req: NextApiRequest, res: NextApiResponse): string | null =>
    getAttributeFromIdToken(req, res, 'custom:noc');

export const signOutUser = async (username: string | null, req: Req, res: Res): Promise<void> => {
    if (username) {
        await globalSignOut(username);
    }

    deleteCookieOnResponseObject(ID_TOKEN_COOKIE, req, res);
    deleteCookieOnResponseObject(REFRESH_TOKEN_COOKIE, req, res);
    deleteCookieOnResponseObject(OPERATOR_COOKIE, req, res);
};

export const getSelectedStages = (req: NextApiRequest): string[] => {
    const requestBody = req.body;

    const selectObjectsArray: string[] = [];

    Object.keys(requestBody).map(e => {
        if (requestBody[e] !== '') {
            selectObjectsArray.push(requestBody[e]);
        }
        return null;
    });

    return selectObjectsArray;
};

export const validateNewPassword = (
    password: string,
    confirmPassword: string,
    inputChecks: ErrorInfo[],
): ErrorInfo[] => {
    let passwordError = '';
    if (password.length < 8) {
        passwordError = password.length === 0 ? 'Enter a new password' : 'Password must be at least 8 characters long';
        inputChecks.push({ id: 'new-password', errorMessage: passwordError });
    } else if (password !== confirmPassword) {
        inputChecks.push({ id: 'new-password', errorMessage: 'Passwords do not match' });
    }
    return inputChecks;
};

export const getSalesOfferPackagesFromRequestBody = (reqBody: { [key: string]: string }): SalesOfferPackage[] => {
    const salesOfferPackageList: SalesOfferPackage[] = [];
    Object.values(reqBody).forEach(entry => {
        const parsedEntry = JSON.parse(entry);
        const purchaseLocationList = parsedEntry.purchaseLocation.split(',');
        const paymentMethodList = parsedEntry.paymentMethod.split(',');
        const ticketFormatList = parsedEntry.ticketFormat.split(',');
        const formattedPackageObject = {
            name: parsedEntry.name,
            description: parsedEntry.description,
            purchaseLocation: purchaseLocationList,
            paymentMethod: paymentMethodList,
            ticketFormat: ticketFormatList,
        };
        salesOfferPackageList.push(formattedPackageObject);
    });
    return salesOfferPackageList;
};

export const putUserDataInS3 = async (
    data: SingleTicket | ReturnTicket | PeriodGeoZoneTicket | PeriodMultipleServicesTicket | FlatFareTicket,
    uuid: string,
): Promise<void> => {
    await putStringInS3(
        MATCHING_DATA_BUCKET_NAME,
        `${data.nocCode}/${data.type}/${uuid}_${Date.now()}.json`,
        JSON.stringify(data),
        'application/json; charset=utf-8',
    );
};

export const getSingleTicketJson = (req: NextApiRequestWithSession, res: NextApiResponse): SingleTicket => {
    const isMatchingInfo = (
        matchingAttributeInfo: MatchingInfo | MatchingWithErrors,
    ): matchingAttributeInfo is MatchingInfo => (matchingAttributeInfo as MatchingInfo)?.service !== null;

    const cookies = new Cookies(req, res);

    const fareTypeCookie = unescapeAndDecodeCookie(cookies, FARE_TYPE_COOKIE);
    const passengerTypeCookie = unescapeAndDecodeCookie(cookies, PASSENGER_TYPE_COOKIE);
    const idToken = unescapeAndDecodeCookie(cookies, ID_TOKEN_COOKIE);
    const matchingAttributeInfo = getSessionAttribute(req, MATCHING_ATTRIBUTE);

    if (!fareTypeCookie || !passengerTypeCookie || !idToken) {
        throw new Error('Necessary session object or cookie not found to create user data json');
    }
    const fareTypeObject = JSON.parse(fareTypeCookie);
    const passengerTypeObject = JSON.parse(passengerTypeCookie);
    const decodedIdToken = decode(idToken) as CognitoIdToken;
    const uuid = getUuidFromCookie(req, res);

    const requestBody: { [key: string]: string } = req.body;
    const salesOfferPackages = getSalesOfferPackagesFromRequestBody(requestBody);

    if (!matchingAttributeInfo || !isMatchingInfo(matchingAttributeInfo)) {
        throw new Error('Required session object does not exist to create single ticket json');
    }

    const { service, userFareStages, matchingFareZones } = matchingAttributeInfo;

    return {
        ...service,
        type: fareTypeObject.fareType,
        ...passengerTypeObject,
        fareZones: getFareZones(userFareStages, matchingFareZones),
        email: decodedIdToken.email,
        uuid,
        products: [salesOfferPackages],
    };
};

export const getReturnTicketJson = (req: NextApiRequestWithSession, res: NextApiResponse): ReturnTicket => {
    const isMatchingInfo = (
        matchingAttributeInfo: MatchingInfo | MatchingWithErrors,
    ): matchingAttributeInfo is MatchingInfo => (matchingAttributeInfo as MatchingInfo)?.service !== null;
    const isInboundMatchingInfo = (
        inboundMatchingAttributeInfo: InboundMatchingInfo | MatchingWithErrors,
    ): inboundMatchingAttributeInfo is InboundMatchingInfo =>
        (inboundMatchingAttributeInfo as InboundMatchingInfo)?.inboundUserFareStages !== null;

    const cookies = new Cookies(req, res);

    const fareTypeCookie = unescapeAndDecodeCookie(cookies, FARE_TYPE_COOKIE);
    const passengerTypeCookie = unescapeAndDecodeCookie(cookies, PASSENGER_TYPE_COOKIE);
    const idToken = unescapeAndDecodeCookie(cookies, ID_TOKEN_COOKIE);
    const matchingAttributeInfo = getSessionAttribute(req, MATCHING_ATTRIBUTE);
    const inboundMatchingAttributeInfo = getSessionAttribute(req, INBOUND_MATCHING_ATTRIBUTE);

    if (!fareTypeCookie || !passengerTypeCookie || !idToken) {
        throw new Error('Necessary session object or cookie not found to create user data json');
    }
    const fareTypeObject = JSON.parse(fareTypeCookie);
    const passengerTypeObject = JSON.parse(passengerTypeCookie);
    const decodedIdToken = decode(idToken) as CognitoIdToken;
    const uuid = getUuidFromCookie(req, res);

    const requestBody: { [key: string]: string } = req.body;
    const salesOfferPackages = getSalesOfferPackagesFromRequestBody(requestBody);

    if (!matchingAttributeInfo || !isMatchingInfo(matchingAttributeInfo)) {
        throw new Error('Required session object does not exist to create single ticket json');
    }

    const { service, userFareStages, matchingFareZones } = matchingAttributeInfo;

    if (!inboundMatchingAttributeInfo || !isInboundMatchingInfo(inboundMatchingAttributeInfo)) {
        throw new Error('Required session object does not exist to create single ticket json');
    }

    const { inboundUserFareStages, inboundMatchingFareZones } = inboundMatchingAttributeInfo;

    return {
        ...service,
        type: fareTypeObject.fareType,
        ...passengerTypeObject,
        outboundFareZones: getFareZones(userFareStages, matchingFareZones),
        inboundFareZones: getFareZones(inboundUserFareStages, inboundMatchingFareZones),
        email: decodedIdToken.email,
        uuid,
        products: [salesOfferPackages],
    };
};

const isPeriodProductDetails = (product: Product): product is ProductDetails =>
    (product as ProductDetails)?.productDuration !== undefined &&
    (product as ProductDetails)?.productValidity !== undefined;

export const getPeriodGeoZoneTicketJson = async (
    req: NextApiRequestWithSession,
    res: NextApiResponse,
): Promise<PeriodGeoZoneTicket> => {
    const isProductData = (
        periodExpiryAttributeInfo: ProductData | PeriodExpiryWithErrors,
    ): periodExpiryAttributeInfo is ProductData => (periodExpiryAttributeInfo as ProductData)?.products !== null;

    const cookies = new Cookies(req, res);

    const nocCode = getNocFromIdToken(req, res);
    const periodTypeCookie = unescapeAndDecodeCookie(cookies, PERIOD_TYPE_COOKIE);
    const passengerTypeCookie = unescapeAndDecodeCookie(cookies, PASSENGER_TYPE_COOKIE);
    const operatorCookie = unescapeAndDecodeCookie(cookies, OPERATOR_COOKIE);
    const idToken = unescapeAndDecodeCookie(cookies, ID_TOKEN_COOKIE);
    const fareZoneCookie = unescapeAndDecodeCookie(cookies, CSV_ZONE_UPLOAD_COOKIE);
    const periodExpiryAttributeInfo = getSessionAttribute(req, PERIOD_EXPIRY_ATTRIBUTE);

    if (!nocCode || !periodTypeCookie || !passengerTypeCookie || !operatorCookie || !idToken || !fareZoneCookie) {
        throw new Error('Necessary session object or cookie not found to create user data json');
    }
    const passengerTypeObject = JSON.parse(passengerTypeCookie);
    const { periodTypeName } = JSON.parse(periodTypeCookie);
    const decodedIdToken = decode(idToken) as CognitoIdToken;
    const uuid = getUuidFromCookie(req, res);
    const requestBody: { [key: string]: string } = req.body;
    const salesOfferPackages = getSalesOfferPackagesFromRequestBody(requestBody);
    const operatorObject = JSON.parse(operatorCookie);
    const { fareZoneName } = JSON.parse(fareZoneCookie);
    const atcoCodes: string[] = await getCsvZoneUploadData(uuid);
    const zoneStops: Stop[] = await batchGetStopsByAtcoCode(atcoCodes);

    if (zoneStops.length === 0) {
        throw new Error(`No stops found for atcoCodes: ${atcoCodes}`);
    }

    if (!periodExpiryAttributeInfo || !isProductData(periodExpiryAttributeInfo)) {
        throw new Error('Required session object does not exist to create single ticket json');
    }

    const { products } = periodExpiryAttributeInfo;

    const productDetailsList: ProductDetails[] = products.map(product => ({
        productName: product.productName,
        productPrice: product.productPrice,
        productDuration: isPeriodProductDetails(product) ? product.productDuration : '',
        productValidity: isPeriodProductDetails(product) ? product.productValidity : '',
        salesOfferPackages,
    }));

    return {
        nocCode,
        type: periodTypeName,
        ...passengerTypeObject,
        email: decodedIdToken.email,
        uuid,
        operatorName: operatorObject.operatorName,
        zoneName: fareZoneName,
        products: productDetailsList,
        stops: zoneStops,
    };
};

export const getPeriodMultipleServicesTicketJson = (
    req: NextApiRequestWithSession,
    res: NextApiResponse,
): PeriodMultipleServicesTicket => {
    const isProductData = (
        periodExpiryAttributeInfo: ProductData | PeriodExpiryWithErrors,
    ): periodExpiryAttributeInfo is ProductData => (periodExpiryAttributeInfo as ProductData)?.products !== null;
    const cookies = new Cookies(req, res);

    const nocCode = getNocFromIdToken(req, res);
    const periodTypeCookie = unescapeAndDecodeCookie(cookies, PERIOD_TYPE_COOKIE);
    const passengerTypeCookie = unescapeAndDecodeCookie(cookies, PASSENGER_TYPE_COOKIE);
    const operatorCookie = unescapeAndDecodeCookie(cookies, OPERATOR_COOKIE);
    const idToken = unescapeAndDecodeCookie(cookies, ID_TOKEN_COOKIE);
    const serviceListCookie = unescapeAndDecodeCookie(cookies, SERVICE_LIST_COOKIE);
    const periodExpiryAttributeInfo = getSessionAttribute(req, PERIOD_EXPIRY_ATTRIBUTE);

    if (!nocCode || !periodTypeCookie || !passengerTypeCookie || !operatorCookie || !idToken || !serviceListCookie) {
        throw new Error('Necessary session object or cookie not found to create user data json');
    }
    const passengerTypeObject = JSON.parse(passengerTypeCookie);
    const { periodTypeName } = JSON.parse(periodTypeCookie);
    const decodedIdToken = decode(idToken) as CognitoIdToken;
    const uuid = getUuidFromCookie(req, res);

    const requestBody: { [key: string]: string } = req.body;
    const salesOfferPackages = getSalesOfferPackagesFromRequestBody(requestBody);
    const operatorObject = JSON.parse(operatorCookie);
    const { selectedServices } = JSON.parse(serviceListCookie);
    const formattedServiceInfo: SelectedService[] = selectedServices.map((selectedService: string) => {
        const service = selectedService.split('#');
        return {
            lineName: service[0],
            serviceCode: service[1],
            startDate: service[2],
            serviceDescription: service[3],
        };
    });

    if (!periodExpiryAttributeInfo || !isProductData(periodExpiryAttributeInfo)) {
        throw new Error('Required session object does not exist to create single ticket json');
    }

    const { products } = periodExpiryAttributeInfo;

    const productDetailsList: ProductDetails[] = products.map(product => ({
        productName: product.productName,
        productPrice: product.productPrice,
        productDuration: isPeriodProductDetails(product) ? product.productDuration : '',
        productValidity: isPeriodProductDetails(product) ? product.productValidity : '',
        salesOfferPackages,
    }));

    return {
        nocCode,
        type: periodTypeName,
        ...passengerTypeObject,
        email: decodedIdToken.email,
        uuid,
        operatorName: operatorObject.operatorName,
        products: productDetailsList,
        selectedServices: formattedServiceInfo,
    };
};

export const getFlatFareTicketJson = (req: NextApiRequestWithSession, res: NextApiResponse): FlatFareTicket => {
    const isProductData = (
        productDetailsAttributeInfo: ProductData | ProductInfo,
    ): productDetailsAttributeInfo is ProductData => (productDetailsAttributeInfo as ProductData)?.products !== null;
    const cookies = new Cookies(req, res);

    const nocCode = getNocFromIdToken(req, res);
    const fareTypeCookie = unescapeAndDecodeCookie(cookies, FARE_TYPE_COOKIE);
    const passengerTypeCookie = unescapeAndDecodeCookie(cookies, PASSENGER_TYPE_COOKIE);
    const operatorCookie = unescapeAndDecodeCookie(cookies, OPERATOR_COOKIE);
    const idToken = unescapeAndDecodeCookie(cookies, ID_TOKEN_COOKIE);
    const serviceListCookie = unescapeAndDecodeCookie(cookies, SERVICE_LIST_COOKIE);
    const productDetailsAttributeInfo = getSessionAttribute(req, PRODUCT_DETAILS_ATTRIBUTE);

    if (!nocCode || !fareTypeCookie || !passengerTypeCookie || !operatorCookie || !idToken || !serviceListCookie) {
        throw new Error('Necessary session object or cookie not found to create user data json');
    }
    const fareTypeObject = JSON.parse(fareTypeCookie);
    const passengerTypeObject = JSON.parse(passengerTypeCookie);
    const decodedIdToken = decode(idToken) as CognitoIdToken;
    const uuid = getUuidFromCookie(req, res);

    const requestBody: { [key: string]: string } = req.body;
    const salesOfferPackages = getSalesOfferPackagesFromRequestBody(requestBody);
    const operatorObject = JSON.parse(operatorCookie);
    const { selectedServices } = JSON.parse(serviceListCookie);
    const formattedServiceInfo: SelectedService[] = selectedServices.map((selectedService: string) => {
        const service = selectedService.split('#');
        return {
            lineName: service[0],
            serviceCode: service[1],
            startDate: service[2],
            serviceDescription: service[3],
        };
    });

    if (!productDetailsAttributeInfo || !isProductData(productDetailsAttributeInfo)) {
        throw new Error('Required session object does not exist to create single ticket json');
    }

    const { products } = productDetailsAttributeInfo;

    const productDetailsList: FlatFareProductDetails[] = products.map(product => ({
        productName: product.productName,
        productPrice: product.productPrice,
        salesOfferPackages,
    }));

    return {
        nocCode,
        type: fareTypeObject.fareType,
        ...passengerTypeObject,
        email: decodedIdToken.email,
        uuid,
        operatorName: operatorObject.operatorName,
        products: productDetailsList,
        selectedServices: formattedServiceInfo,
    };
};
