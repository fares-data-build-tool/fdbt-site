import { NextApiResponse } from 'next';
import Cookies from 'cookies';
import { decode } from 'jsonwebtoken';
import {
    redirectTo,
    redirectToError,
    getUuidFromCookie,
    unescapeAndDecodeCookie,
    getNocFromIdToken,
    getSalesOfferPackagesFromRequestBody,
} from './apiUtils';
import { isSessionValid, isCookiesUUIDMatch } from './service/validator';
import {
    SALES_OFFER_PACKAGES_ATTRIBUTE,
    FARE_TYPE_COOKIE,
    PASSENGER_TYPE_COOKIE,
    ID_TOKEN_COOKIE,
    OPERATOR_COOKIE,
    PRODUCT_DETAILS_COOKIE,
    DAYS_VALID_COOKIE,
} from '../../constants';
import { Stop } from '../../data/auroradb';
import { UserFareStages } from '../../data/s3';
import {
    BasicService,
    CognitoIdToken,
    PassengerDetails,
    ServicesInfo,
    NextApiRequestWithSession,
} from '../../interfaces';
import { getFareZones, putMatchingDataInS3 } from './apiUtils/matching';
import {
    MatchingFareZones,
    MatchingData,
    MatchingReturnData,
    MatchingPeriodData,
} from '../../interfaces/matchingInterface';
import { updateSessionAttribute } from '../../utils/sessions';

const getMatchingJson = (
    service: BasicService,
    userFareStages: UserFareStages,
    inboundUserFareStages: UserFareStages,
    matchingFareZones: MatchingFareZones,
    inboundMatchingFareZones: MatchingFareZones,
    fareType: string,
    passengerTypeObject: PassengerDetails,
    email: string,
    uuid: string,
    operatorName: string,
    nocCode: string | null,
    products: Product[],
    selectedServices?: ServicesInfo[],
    zoneName?: string,
    stops?: Stop[],
): MatchingData | MatchingReturnData | MatchingPeriodData | {} => {
    if (fareType === 'return') {
        return {
            ...service,
            type: 'return',
            outboundFareZones: getFareZones(userFareStages, matchingFareZones),
            inboundFareZones: getFareZones(inboundUserFareStages, inboundMatchingFareZones),
            ...passengerTypeObject,
            email,
            uuid,
        };
    }
    if (fareType === 'single') {
        return {
            ...service,
            type: 'single',
            fareZones: getFareZones(userFareStages, matchingFareZones),
            ...passengerTypeObject,
            email,
            uuid,
        };
    }
    if (fareType === 'period') {
        return {
            operatorName,
            type: 'period',
            nocCode,
            email,
            uuid,
            products,
            ...passengerTypeObject,
            ...selectedServices,
            zoneName,
            ...stops,
        };
    }
    return {};
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (!isCookiesUUIDMatch(req, res)) {
            throw new Error('Cookie UUIDs do not match');
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            updateSessionAttribute(req, SALES_OFFER_PACKAGES_ATTRIBUTE, {
                body: { errorMessage: 'Choose at least one service from the options' },
            });
            redirectTo(res, `/selectSalesOfferPackage`);
            return;
        }

        const requestBody: { [key: string]: string } = req.body;
        const salesOfferPackages = getSalesOfferPackagesFromRequestBody(requestBody);

        const nocCode = getNocFromIdToken(req, res);
        const uuid = getUuidFromCookie(req, res);

        const cookies = new Cookies(req, res);

        const operatorCookie = unescapeAndDecodeCookie(cookies, OPERATOR_COOKIE);
        const fareTypeCookie = unescapeAndDecodeCookie(cookies, FARE_TYPE_COOKIE);
        const passengerTypeCookie = unescapeAndDecodeCookie(cookies, PASSENGER_TYPE_COOKIE);
        const productDetailsCookie = unescapeAndDecodeCookie(cookies, PRODUCT_DETAILS_COOKIE);
        const daysValidCookie = unescapeAndDecodeCookie(cookies, DAYS_VALID_COOKIE);
        const idToken = unescapeAndDecodeCookie(cookies, ID_TOKEN_COOKIE);

        const operatorObject = JSON.parse(operatorCookie);
        const fareTypeObject = JSON.parse(fareTypeCookie);
        const passengerTypeObject = JSON.parse(passengerTypeCookie);
        const { productName, productPrice } = JSON.parse(productDetailsCookie);
        const { daysValid } = JSON.parse(daysValidCookie);
        const decodedIdToken = decode(idToken) as CognitoIdToken;

        const products: Product[] = [
            {
                productName,
                productPrice,
                productDuration: daysValid,
                productValidity: periodValid,
            },
        ];

        const matchingJson = getMatchingJson(
            service,
            userFareStages,
            inboundUserFareStages,
            matchingFareZones,
            inboundMatchingFareZones,
            fareTypeObject.fareType,
            passengerTypeObject,
            decodedIdToken.email,
            uuid,
            operatorObject.operatorName,
            nocCode,
            products,
            selectedServices,
            zoneName,
            stops,
        );

        await putMatchingDataInS3(matchingJson, uuid);

        redirectTo(res, '/thankyou');
        return;
    } catch (error) {
        const message =
            'There was a problem processing the selected sales offer packages from the salesOfferPackage page:';
        redirectToError(res, message, error);
    }
};
