import { NextApiResponse } from 'next';
import { updateSessionAttribute, getSessionAttribute } from '../../utils/sessions';
import { redirectToError, redirectTo, redirectOnFareType } from './apiUtils/index';
import { PASSENGER_TYPE_ATTRIBUTE, FARE_TYPE_ATTRIBUTE } from '../../constants/index';
import { NextApiRequestWithSession } from '../../interfaces';
import { isSessionValid } from './service/validator';

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }
        const { fareType } = getSessionAttribute(req, FARE_TYPE_ATTRIBUTE);
        if (!fareType) {
            throw new Error('Necessary fare type info not found for passenger type page');
        }

        if (req.body.passengerType) {
            updateSessionAttribute(req, PASSENGER_TYPE_ATTRIBUTE, {
                errorMessage: '',
                passengerType: req.body.passengerType,
            });

            if (req.body.passengerType === 'anyone') {
                redirectOnFareType(req, res);
                return;
            }
            redirectTo(res, '/definePassengerType');
            return;
        }

        updateSessionAttribute(req, PASSENGER_TYPE_ATTRIBUTE, {
            errorMessage: 'Choose a passenger type from the options',
        });
        redirectTo(res, '/passengerType');
    } catch (error) {
        const message = 'There was a problem selecting the passenger type:';
        redirectToError(res, message, error);
    }
};
