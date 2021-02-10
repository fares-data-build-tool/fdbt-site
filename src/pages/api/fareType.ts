import { NextApiResponse } from 'next';
import { redirectToError, redirectTo } from './apiUtils/index';
import { updateSessionAttribute } from '../../utils/sessions';
import { FARE_TYPE_ATTRIBUTE, PASSENGER_TYPE_ATTRIBUTE } from '../../constants/index';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';

export interface FareType {
    fareType: string;
}

export interface FareTypeWithErrors {
    errors: ErrorInfo[];
}

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (req.body.fareType) {
            updateSessionAttribute(req, FARE_TYPE_ATTRIBUTE, {
                fareType: req.body.fareType,
            });
            if (req.body.fareType === 'schoolService') {
                updateSessionAttribute(req, PASSENGER_TYPE_ATTRIBUTE, { passengerType: 'schoolPupil' });
                redirectTo(res, '/definePassengerType');
                return;
            }
            redirectTo(res, '/passengerType');
        } else {
            const errors: ErrorInfo[] = [
                { id: 'fare-type-single', errorMessage: 'Choose a fare type from the options' },
            ];
            updateSessionAttribute(req, FARE_TYPE_ATTRIBUTE, {
                errors,
            });
            redirectTo(res, '/fareType');
        }
    } catch (error) {
        const message = 'There was a problem selecting the fare type.';
        redirectToError(res, message, 'api.fareType', error);
    }
};
