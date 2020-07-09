import { NextApiResponse } from 'next';
import { NextRequestWithSession } from '../../interfaces';
import { updateSessionAttribute } from '../../utils/sessions';
import { redirectToError, redirectTo, redirectOnFareType } from './apiUtils';
import { PASSENGER_TYPE_ATTRIBUTE } from '../../constants/index';
import { isSessionValid } from './service/validator';

export default (req: NextRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (req.body.passengerType) {
            const { passengerType } = req.body;
            updateSessionAttribute(req, PASSENGER_TYPE_ATTRIBUTE, passengerType);
            if (passengerType === 'anyone') {
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
