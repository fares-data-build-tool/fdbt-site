import { NextApiRequest, NextApiResponse } from 'next';
import { getDomain, setCookieOnResponseObject, redirectToError, redirectTo, getUuidFromCookie } from './apiUtils/index';
import { FARE_TYPE_COOKIE } from '../../constants/index';
import { verifyToken } from './service/authentication';

import { isSessionValid } from './service/validator';

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        verifyToken(req, res);

        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (req.body.fareType) {
            const cookieValue = JSON.stringify({
                errorMessage: '',
                uuid: getUuidFromCookie(req, res),
                fareType: req.body.fareType,
            });
            setCookieOnResponseObject(getDomain(req), FARE_TYPE_COOKIE, cookieValue, req, res);
            redirectTo(res, '/passengerType');
        } else {
            const cookieValue = JSON.stringify({
                errorMessage: 'Choose a fare type from the options',
                uuid: getUuidFromCookie(req, res),
            });
            setCookieOnResponseObject(getDomain(req), FARE_TYPE_COOKIE, cookieValue, req, res);
            redirectTo(res, '/fareType');
        }
    } catch (error) {
        const message = 'There was a problem selecting the fare type.';
        redirectToError(res, message, error);
    }
};
