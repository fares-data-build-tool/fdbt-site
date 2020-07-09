import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import { OPERATOR_COOKIE, SERVICE_ATTRIBUTE, JOURNEY_ATTRIBUTE } from '../../../constants';
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
    const serviceCookie = unescapeAndDecodeCookie(cookies, SERVICE_ATTRIBUTE);
    const journeyCookie = unescapeAndDecodeCookie(cookies, JOURNEY_ATTRIBUTE);
    try {
        const operatorInfo = JSON.parse(operatorCookie);
        const serviceInfo = JSON.parse(serviceCookie);
        const journeyInfo = JSON.parse(journeyCookie);

        const { uuid } = operatorInfo;

        if (serviceInfo.uuid === uuid && journeyInfo.uuid === uuid) {
            return true;
        }
    } catch (error) {
        console.error(error.stack);
        return false;
    }

    console.error(new Error().stack);
    return false;
};
