import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import { decode } from 'jsonwebtoken';
import {
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
    getUuidFromCookie,
    unescapeAndDecodeCookie,
    getNocFromIdToken,
} from './apiUtils';
import { isSessionValid, isCookiesUUIDMatch } from './service/validator';
import {
    SALES_OFFER_PACKAGE_COOKIE,
    MATCHING_DATA_BUCKET_NAME,
    FARE_TYPE_COOKIE,
    PASSENGER_TYPE_COOKIE,
    ID_TOKEN_COOKIE,
    OPERATOR_COOKIE,
    PRODUCT_DETAILS_COOKIE,
    DAYS_VALID_COOKIE,
} from '../../constants';
import { Stop } from '../../data/auroradb';
import { putStringInS3, UserFareStages } from '../../data/s3';
import { BasicService, CognitoIdToken, PassengerDetails, ServicesInfo } from '../../interfaces';
import { getFareZones } from './apiUtils/matching';
import { Price } from '../../interfaces/matchingInterface';

interface MatchingBaseData {
    type: string;
    lineName: string;
    nocCode: string;
    operatorShortName: string;
    serviceDescription: string;
    email: string;
    uuid: string;
}

interface MatchingData extends MatchingBaseData {
    fareZones: {
        name: string;
        stops: Stop[];
        prices: {
            price: string;
            fareZones: string[];
        }[];
    }[];
}

interface MatchingReturnData extends MatchingBaseData {
    outboundFareZones: {
        name: string;
        stops: Stop[];
        prices: {
            price: string;
            fareZones: string[];
        }[];
    }[];
    inboundFareZones: {
        name: string;
        stops: Stop[];
        prices: {
            price: string;
            fareZones: string[];
        }[];
    }[];
}

interface MatchingFareZones {
    [key: string]: {
        name: string;
        stops: Stop[];
        prices: Price[];
    };
}

interface Product {
    productName: string;
    productPrice: string;
    productDuration?: string;
    productValidity?: string;
}

interface MatchingPeriodData extends PassengerDetails {
    operatorName: string;
    type: string;
    nocCode: string;
    products: Product[];
    selectedServices?: ServicesInfo[];
    zoneName?: string;
    stops?: Stop[];
    email: string;
    uuid: string;
}

export const putMatchingDataInS3 = async (data: MatchingData | MatchingReturnData, uuid: string): Promise<void> => {
    await putStringInS3(
        MATCHING_DATA_BUCKET_NAME,
        `${data.nocCode}/${data.type}/${uuid}_${Date.now()}.json`,
        JSON.stringify(data),
        'application/json; charset=utf-8',
    );
};

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

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }
        if (!isCookiesUUIDMatch(req, res)) {
            throw new Error('Cookie UUIDs do not match');
        }
        if (!req.body || Object.keys(req.body).length === 0) {
            const cookieValue = JSON.stringify({ errorMessage: 'Choose at least one service from the options' });
            setCookieOnResponseObject(SALES_OFFER_PACKAGE_COOKIE, cookieValue, req, res);
            redirectTo(res, `/selectSalesOfferPackage`);
            return;
        }

        const checkedSalesOfferPackageList: string[] = [];

        const requestBody: { [key: string]: string | string[] } = req.body;

        Object.entries(requestBody).forEach(entry => {
            const name = entry[0];
            const packageDescription = entry[1];
            const data = `${name}#${packageDescription}`;
            checkedSalesOfferPackageList.push(data);
        });

        const uuid = getUuidFromCookie(req, res);

        const cookies = new Cookies(req, res);
        const operatorCookie = unescapeAndDecodeCookie(cookies, OPERATOR_COOKIE);
        const fareTypeCookie = unescapeAndDecodeCookie(cookies, FARE_TYPE_COOKIE);
        const passengerTypeCookie = unescapeAndDecodeCookie(cookies, PASSENGER_TYPE_COOKIE);
        const productDetailsCookie = unescapeAndDecodeCookie(cookies, PRODUCT_DETAILS_COOKIE);
        const daysValidCookie = unescapeAndDecodeCookie(cookies, DAYS_VALID_COOKIE);
        const nocCode = getNocFromIdToken(req, res);
        const operatorObject = JSON.parse(operatorCookie);
        const fareTypeObject = JSON.parse(fareTypeCookie);
        const passengerTypeObject = JSON.parse(passengerTypeCookie);
        const { productName, productPrice } = JSON.parse(productDetailsCookie);
        const { daysValid } = JSON.parse(daysValidCookie);

        const idToken = unescapeAndDecodeCookie(cookies, ID_TOKEN_COOKIE);
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
