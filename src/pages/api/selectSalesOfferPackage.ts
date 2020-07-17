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
    PRODUCT_DETAILS_ATTRIBUTE,
    DAYS_VALID_COOKIE,
    MATCHING_ATTRIBUTE,
    CSV_ZONE_UPLOAD_COOKIE,
    SERVICE_LIST_COOKIE,
    INBOUND_MATCHING_ATTRIBUTE,
    PERIOD_EXPIRY_ATTRIBUTE,
} from '../../constants';
import { CognitoIdToken, NextApiRequestWithSession } from '../../interfaces';
import { putMatchingDataInS3, getMatchingJson } from './apiUtils/matching';
import { updateSessionAttribute, getSessionAttribute } from '../../utils/sessions';

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

        const cookies = new Cookies(req, res);
        const operatorCookie = unescapeAndDecodeCookie(cookies, OPERATOR_COOKIE);
        const fareTypeCookie = unescapeAndDecodeCookie(cookies, FARE_TYPE_COOKIE);
        const fareZoneCookie = unescapeAndDecodeCookie(cookies, CSV_ZONE_UPLOAD_COOKIE);
        const serviceListCookie = unescapeAndDecodeCookie(cookies, SERVICE_LIST_COOKIE);
        const passengerTypeCookie = unescapeAndDecodeCookie(cookies, PASSENGER_TYPE_COOKIE);
        const idToken = unescapeAndDecodeCookie(cookies, ID_TOKEN_COOKIE);

        const operatorObject = JSON.parse(operatorCookie);
        const fareTypeObject = JSON.parse(fareTypeCookie);
        const passengerTypeObject = JSON.parse(passengerTypeCookie);
        const decodedIdToken = decode(idToken) as CognitoIdToken;
        const { service, userFareStages, matchingFareZones } = getSessionAttribute(req, MATCHING_ATTRIBUTE);
        const { inboundUserFareStages, inboundMatchingFareZones } = getSessionAttribute(
            req,
            INBOUND_MATCHING_ATTRIBUTE,
        );
        const { products } = getSessionAttribute(req, PERIOD_EXPIRY_ATTRIBUTE);
        const { productDetails } = getSessionAttribute(req, PRODUCT_DETAILS_ATTRIBUTE);
        const salesOfferPackages = getSalesOfferPackagesFromRequestBody(requestBody);
        const nocCode = getNocFromIdToken(req, res);
        const uuid = getUuidFromCookie(req, res);

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
            salesOfferPackages,
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
