import { NextApiResponse } from 'next';
import { COOKIES_POLICY_COOKIE, COOKIE_PREFERENCES_COOKIE, COOKIE_SETTINGS_SAVED_COOKIE } from '../../constants';
import { NextApiRequestWithSession } from '../../interfaces';
import { redirectTo, redirectToError, setCookieOnResponseObject } from './apiUtils';

export interface CookiePolicy {
    essential: boolean;
    usage: boolean;
}

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        const { tracking } = req.body;

        if (!tracking) {
            redirectTo(res, '/cookies');
            return;
        }

        const cookiePolicy: CookiePolicy = { essential: true, usage: tracking === 'on' || false };

        // UPDATE BELOW COOKIE LIFETIMES
        setCookieOnResponseObject(COOKIE_SETTINGS_SAVED_COOKIE, 'true', req, res);
        setCookieOnResponseObject(COOKIE_PREFERENCES_COOKIE, 'true', req, res);
        setCookieOnResponseObject(COOKIES_POLICY_COOKIE, JSON.stringify(cookiePolicy), req, res);

        redirectTo(res, '/cookies');
    } catch (error) {
        const message = 'There was a problem saving cookie preferences.';
        redirectToError(res, message, 'api.cookies', error);
    }
};
