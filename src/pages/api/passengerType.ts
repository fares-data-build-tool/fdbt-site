import { NextApiRequest, NextApiResponse } from 'next';
import { redirectToError, redirectTo, redirectOnFareType, updateSession } from './apiUtils/index';
import { PASSENGER_TYPE_COOKIE } from '../../constants/index';
import { isSessionValid } from './service/validator';

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (req.body.passengerType) {
            const { passengerType } = req.body;
            updateSession(PASSENGER_TYPE_COOKIE, passengerType, req);
            if (passengerType === 'anyone') {
                redirectOnFareType(req, res);
                return;
            }
            redirectTo(res, '/definePassengerType');
            return;
        }

        updateSession(
            PASSENGER_TYPE_COOKIE,
            {
                errorMessage: 'Choose a passenger type from the options',
            },
            req,
        );
        redirectTo(res, '/passengerType');
    } catch (error) {
        const message = 'There was a problem selecting the passenger type:';
        redirectToError(res, message, error);
    }
};
