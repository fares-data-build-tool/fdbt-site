import { NextApiRequest, NextApiResponse } from 'next';
import {
    setCookieOnResponseObject,
    redirectToError,
    redirectTo,
    getUuidFromCookie,
    updateSession,
} from './apiUtils/index';
import { FARE_TYPE_COOKIE } from '../../constants/index';

import { isSessionValid } from './service/validator';

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        console.log('Initial session', (req as any).session);
        if (req.body.fareType) {
            const fareTypeObj = {
                errorMessage: '',
                uuid: getUuidFromCookie(req, res),
                fareType: req.body.fareType,
            };
            const cookieValue = JSON.stringify(fareTypeObj);
            updateSession(FARE_TYPE_COOKIE, fareTypeObj, req);
            console.log('After processing the request', (req as any).session);
            setCookieOnResponseObject(FARE_TYPE_COOKIE, cookieValue, req, res);
            redirectTo(res, '/passengerType');
        } else {
            const fareTypeObj = {
                errorMessage: 'Choose a fare type from the options',
                uuid: getUuidFromCookie(req, res),
            };
            const cookieValue = JSON.stringify(fareTypeObj);
            updateSession(FARE_TYPE_COOKIE, fareTypeObj, req);
            setCookieOnResponseObject(FARE_TYPE_COOKIE, cookieValue, req, res);
            redirectTo(res, '/fareType');
        }
    } catch (error) {
        const message = 'There was a problem selecting the fare type.';
        redirectToError(res, message, error);
    }
};
