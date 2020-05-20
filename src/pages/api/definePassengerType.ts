import { NextApiRequest, NextApiResponse } from 'next';
import { redirectToError, redirectTo } from './apiUtils/index';
// import { USER_TYPE_COOKIE } from '../../constants/index';

import { isSessionValid } from './service/validator';

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (!req.body.ageRange || !req.body.proof) {
            redirectTo(res, '/definePassengerType');
        }
        console.log(req.body);

        // redirectOnFareType(req, res);
        redirectTo(res, '/definePassengerType');
    } catch (error) {
        const message = 'There was a problem in the definePassengerType API.';
        redirectToError(res, message, error);
    }
};
