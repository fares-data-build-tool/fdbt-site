import { NextApiResponse } from 'next';
import { NextRequestWithSession } from '../../interfaces';
import { getUuidFromCookie } from '../../utils';
import { updateSessionAttribute } from '../../utils/sessions';
import { redirectToError, redirectTo } from './apiUtils';
import { FARE_TYPE_ATTRIBUTE } from '../../constants/index';

import { isSessionValid } from './service/validator';

export default (req: NextRequestWithSession, res: NextApiResponse): void => {
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
            updateSessionAttribute(req, FARE_TYPE_ATTRIBUTE, fareTypeObj);
            redirectTo(res, '/passengerType');
        } else {
            const fareTypeObj = {
                errorMessage: 'Choose a fare type from the options',
                uuid: getUuidFromCookie(req, res),
            };
            updateSessionAttribute(req, FARE_TYPE_ATTRIBUTE, fareTypeObj);
            redirectTo(res, '/fareType');
        }
    } catch (error) {
        const message = 'There was a problem selecting the fare type.';
        redirectToError(res, message, error);
    }
};
