import { NextApiResponse } from 'next';
import { updateSessionAttribute } from '../../utils/sessions';
import { NextApiRequestWithSession } from '../../interfaces';
import { redirectToError, redirectTo, getUuidFromCookie } from './apiUtils/index';
import { FARE_TYPE_ATTRIBUTE } from '../../constants/index';

import { isSessionValid } from './service/validator';

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (req.body.fareType) {
            updateSessionAttribute(req, FARE_TYPE_ATTRIBUTE, {
                body: {
                    errorMessage: '',
                    uuid: getUuidFromCookie(req, res),
                    fareType: req.body.fareType,
                },
            });
            redirectTo(res, '/passengerType');
        } else {
            updateSessionAttribute(req, FARE_TYPE_ATTRIBUTE, {
                body: {
                    errorMessage: 'Choose a fare type from the options',
                    uuid: getUuidFromCookie(req, res),
                },
            });
            redirectTo(res, '/fareType');
        }
    } catch (error) {
        const message = 'There was a problem selecting the fare type.';
        redirectToError(res, message, error);
    }
};
