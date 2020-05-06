import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import {
    OPERATOR_COOKIE,
    SERVICE_COOKIE,
    JOURNEY_COOKIE,
    PERIOD_PRODUCT_COOKIE,
    CSV_ZONE_UPLOAD_COOKIE,
    SERVICE_LIST,
} from '../../../constants';
import { unescapeAndDecodeCookie } from '../apiUtils';

export const isSessionValid = (req: NextApiRequest, res: NextApiResponse): boolean => {
    const cookies = new Cookies(req, res);
    const operatorCookie = cookies.get(OPERATOR_COOKIE) || '';
    if (operatorCookie) {
        return true;
    }
    console.debug('Invalid session - no operator cookie found.');
    return false;
};

export const isCookiesUUIDMatch = (req: NextApiRequest, res: NextApiResponse): boolean => {
    const cookies = new Cookies(req, res);
    const operatorCookie = unescapeAndDecodeCookie(cookies, OPERATOR_COOKIE);
    const serviceCookie = unescapeAndDecodeCookie(cookies, SERVICE_COOKIE);
    const journeyCookie = unescapeAndDecodeCookie(cookies, JOURNEY_COOKIE);
    try {
        const operatorInfo = JSON.parse(operatorCookie);
        const serviceInfo = JSON.parse(serviceCookie);
        const journeyInfo = JSON.parse(journeyCookie);

        const { uuid } = operatorInfo;

        if (serviceInfo.uuid === uuid && journeyInfo.uuid === uuid) {
            return true;
        }
    } catch (err) {
        console.error(err.stack);
        return false;
    }

    console.error(new Error().stack);
    return false;
};

export const isPeriodCookiesUUIDMatch = (req: NextApiRequest, res: NextApiResponse): boolean => {
    let csvZoneUpload;
    let serviceList;
    const cookies = new Cookies(req, res);

    const csvUploadZoneUploadCookie = unescapeAndDecodeCookie(cookies, CSV_ZONE_UPLOAD_COOKIE);
    const periodProductCookie = unescapeAndDecodeCookie(cookies, PERIOD_PRODUCT_COOKIE);
    const operatorCookie = unescapeAndDecodeCookie(cookies, OPERATOR_COOKIE);
    const serviceListCookie = unescapeAndDecodeCookie(cookies, SERVICE_LIST);

    try {
        const operatorInfo = JSON.parse(operatorCookie);
        const periodProduct = JSON.parse(periodProductCookie);

        if (csvUploadZoneUploadCookie) {
            csvZoneUpload = JSON.parse(csvUploadZoneUploadCookie);
        }
        if (serviceListCookie) {
            serviceList = JSON.parse(serviceListCookie);
        }

        const { uuid } = operatorInfo;

        if (periodProduct.uuid === uuid && (csvZoneUpload?.uuid === uuid || serviceList?.uuid === uuid)) {
            return true;
        }
    } catch (err) {
        console.error(err.stack);
        return false;
    }

    console.error(new Error().stack);
    return false;
};
