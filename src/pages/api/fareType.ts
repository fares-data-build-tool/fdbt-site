import { NextApiResponse } from 'next';
import { redirectToError, redirectTo } from './apiUtils/index';
import { updateSessionAttribute } from '../../utils/sessions';
import { FARE_TYPE_ATTRIBUTE } from '../../constants/index';

import { isSessionValid } from './apiUtils/validator';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
        }

        if (req.body.fareType) {
            updateSessionAttribute(req, FARE_TYPE_ATTRIBUTE, {
                fareType: req.body.fareType,
            });
            redirectTo(res, '/passengerType');
        } else {
            const errors: ErrorInfo[] = [
                { id: 'fare-type-error', errorMessage: 'Choose a fare type from the options' },
            ];
            updateSessionAttribute(req, FARE_TYPE_ATTRIBUTE, {
                errors,
                fareType: '',
            });
            redirectTo(res, '/fareType');
        }
    } catch (error) {
        const message = 'There was a problem selecting the fare type.';
        redirectToError(res, message, 'api.fareType', error);
    }
};
