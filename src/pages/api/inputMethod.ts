import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import { setCookieOnResponseObject, getDomain, redirectTo, redirectToError } from './apiUtils/index';
import { isSessionValid } from './service/validator';
import { OPERATOR_COOKIE, INPUT_METHOD_COOKIE } from '../../constants';

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const cookies = new Cookies(req, res);
        const operatorCookie = unescape(decodeURI(cookies.get(OPERATOR_COOKIE) || ''));
        const operatorObject = JSON.parse(operatorCookie);
        const { uuid } = operatorObject;

        if (!uuid) {
            throw new Error('No UUID found');
        }

        if (req.body.inputMethod) {
            switch (req.body.inputMethod) {
                case 'csv':
                    redirectTo(res, '/csvUpload');
                    break;
                case 'manual':
                    redirectTo(res, '/howManyStages');
                    break;
                case 'interactiveMap':
                    // redirect to map page
                    break;
                default:
                    throw new Error('Input method we expect was not received.');
            }
        } else {
            const cookieValue = JSON.stringify({ errorMessage: 'Choose an input method from the options' }, uuid);
            setCookieOnResponseObject(getDomain(req), INPUT_METHOD_COOKIE, cookieValue, req, res);
            redirectTo(res, '/inputMethod');
        }
    } catch (error) {
        const message = 'There was a problem selecting the input method for the triangle:';
        redirectToError(res, message, error);
    }
};
