import { NextApiResponse } from 'next';
import { NextRequestWithSession, ErrorInfo } from '../../interfaces';
import { validateNewPassword } from '../../utils';
import { redirectTo, redirectToError, setCookieOnResponseObject } from './apiUtils';
import { USER_ATTRIBUTE } from '../../constants';
import { confirmForgotPassword } from '../../data/cognito';

export default async (req: NextRequestWithSession, res: NextApiResponse): Promise<void> => {
    const setErrorsCookie = (inputChecks: ErrorInfo[], regKey: string, username: string, expiry: string): void => {
        const cookieContent = JSON.stringify({ inputChecks });
        setCookieOnResponseObject(req, res, USER_ATTRIBUTE, cookieContent);
        redirectTo(res, `/resetPassword?key=${regKey}&user_name=${username}&expiry=${expiry}`);
    };

    try {
        const { username, password, confirmPassword, regKey, expiry } = req.body;

        let inputChecks: ErrorInfo[] = [];

        if (!username || !regKey) {
            inputChecks.push({
                id: 'new-password',
                errorMessage: 'There was a problem resetting your password.',
            });
        }

        inputChecks = validateNewPassword(password, confirmPassword, inputChecks);

        if (inputChecks.some(el => el.errorMessage !== '')) {
            setErrorsCookie(inputChecks, regKey, username, expiry);
            return;
        }

        try {
            await confirmForgotPassword(username, regKey, password);
            setCookieOnResponseObject(req, res, USER_ATTRIBUTE, JSON.stringify({ redirectFrom: '/resetPassword' }));
            redirectTo(res, '/passwordUpdated');
        } catch (error) {
            if (error.message === 'ExpiredCodeException') {
                redirectTo(res, '/resetLinkExpired');
                return;
            }

            console.warn('reset password failed', { error: error?.message });
            inputChecks.push({
                id: 'new-password',
                errorMessage: 'There was a problem resetting your password.',
            });

            setErrorsCookie(inputChecks, regKey, username, expiry);
        }
    } catch (error) {
        const message = 'There was an error resetting password.';
        redirectToError(res, message, error);
    }
};
