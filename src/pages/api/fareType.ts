import { NextApiRequest, NextApiResponse } from 'next';
import { redirectToError, redirectTo, getUuidFromCookie, updateSessionAttribute } from './apiUtils/index';
import { FARE_TYPE_COOKIE } from '../../constants/index';

import { isSessionValid } from './service/validator';

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }
        if (req.body.fareType) {
            const fareTypeObj = {
                errorMessage: '',
                uuid: getUuidFromCookie(req, res),
                fareType: req.body.fareType,
            };
            updateSessionAttribute(req, FARE_TYPE_COOKIE, fareTypeObj);
            redirectTo(res, '/passengerType');
        } else {
            const fareTypeObj = {
                errorMessage: 'Choose a fare type from the options',
                uuid: getUuidFromCookie(req, res),
            };
            updateSessionAttribute(req, FARE_TYPE_COOKIE, fareTypeObj);
            redirectTo(res, '/fareType');
        }
    } catch (error) {
        const message = 'There was a problem selecting the fare type.';
        redirectToError(res, message, error);
    }
};
