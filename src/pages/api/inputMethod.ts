import { NextApiResponse } from 'next';
import { NextRequestWithSession } from '../../interfaces';
import { redirectTo, redirectToError, setCookieOnResponseObject } from './apiUtils';
import { isSessionValid } from './service/validator';
import { INPUT_METHOD_ATTRIBUTE } from '../../constants';

export default (req: NextRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (req.body.inputMethod) {
            switch (req.body.inputMethod) {
                case 'csv':
                    redirectTo(res, '/csvUpload');
                    return;
                case 'manual':
                    redirectTo(res, '/howManyStages');
                    return;
                case 'interactiveMap':
                    // redirect to map page
                    return;
                default:
                    throw new Error('Input method we expect was not received.');
            }
        } else {
            const cookieValue = JSON.stringify({ errorMessage: 'Choose an input method from the options' });
            setCookieOnResponseObject(req, res, INPUT_METHOD_ATTRIBUTE, cookieValue);
            redirectTo(res, '/inputMethod');
        }
    } catch (error) {
        const message = 'There was a problem selecting the input method for the triangle:';
        redirectToError(res, message, error);
    }
};
