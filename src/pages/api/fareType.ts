import { Request, Response } from 'express';
import { redirectToError, redirectTo, getUuidFromCookie } from './apiUtils/index';
import { FARE_TYPE_COOKIE } from '../../constants/index';

import { isSessionValid } from './service/validator';

export default (req: Request, res: Response): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (req.body.fareType) {
            const cookieValue = JSON.stringify({
                errorMessage: '',
                uuid: getUuidFromCookie(req, res),
                fareType: req.body.fareType,
            });

            if (req.session) {
                req.session[FARE_TYPE_COOKIE] = cookieValue;
            }

            redirectTo(res, '/passengerType');
        } else {
            const cookieValue = JSON.stringify({
                errorMessage: 'Choose a fare type from the options',
                uuid: getUuidFromCookie(req, res),
            });

            if (req.session) {
                console.log('HELLO');
                req.session[FARE_TYPE_COOKIE] = cookieValue;
            }

            redirectTo(res, '/fareType');
        }
    } catch (error) {
        const message = 'There was a problem selecting the fare type.';
        redirectToError(res, message, error);
    }
};
