import { NextApiRequest, NextApiResponse } from 'next';
import { redirectToError, redirectTo, setCookieOnResponseObject } from './apiUtils/index';
import { NUMBER_OF_STAGES_COOKIE } from '../../constants/index';

import { isSessionValid } from './service/validator';

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (req.body.howManyStages) {
            switch (req.body.howManyStages) {
                case 'lessThan20':
                    redirectTo(res, '/chooseStages');
                    return;
                case 'moreThan20':
                    redirectTo(res, '/csvUpload');
                    return;
                default:
                    throw new Error('Number of fare stages we expect was not received.');
            }
        } else {
            const cookieValue = JSON.stringify({
                errorMessage: 'Choose an option regarding how many fare stages you have',
            });
            setCookieOnResponseObject(req, res, NUMBER_OF_STAGES_COOKIE, cookieValue);
            redirectTo(res, '/howManyStages');
        }
    } catch (error) {
        const message = 'There was a problem selecting how many fares stages the triangle has:';
        redirectToError(res, message, error);
    }
};
