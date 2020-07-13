import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import { OPERATOR_COOKIE, SERVICE_ATTRIBUTE, JOURNEY_COOKIE } from '../../../constants';
import { unescapeAndDecodeCookie } from '../apiUtils';
import { getSessionAttribute } from '../../../utils/sessions';
import { NextApiRequestWithSession } from '../../../interfaces';

export const isSessionValid = (req: NextApiRequest, res: NextApiResponse): boolean => {
    const cookies = new Cookies(req, res);
    const operatorCookie = cookies.get(OPERATOR_COOKIE) || '';
    if (operatorCookie) {
        return true;
    }
    console.debug('Invalid session - no operator cookie found.');
    return false;
};

export const isCookiesUUIDMatch = (req: NextApiRequestWithSession, res: NextApiResponse): boolean => {
    const cookies = new Cookies(req, res);
    const operatorCookie = unescapeAndDecodeCookie(cookies, OPERATOR_COOKIE);
    const serviceInfo = getSessionAttribute(req, SERVICE_ATTRIBUTE);
    const journeyCookie = unescapeAndDecodeCookie(cookies, JOURNEY_COOKIE);
    try {
        const operatorInfo = JSON.parse(operatorCookie);
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
