import { NextApiRequest, NextApiResponse } from 'next';
import { updateSession, redirectTo, redirectToError, checkEmailValid } from './apiUtils/index';
import { FORGOT_PASSWORD_COOKIE } from '../../constants/index';

import { forgotPassword } from '../../data/cognito';

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email || !email.trim().length) {
            updateSession(FORGOT_PASSWORD_COOKIE, { email, error: 'Enter your email address' }, req);
            redirectTo(res, '/forgotPassword');
            return;
        }

        if (checkEmailValid(email)) {
            await forgotPassword(email);
            updateSession(FORGOT_PASSWORD_COOKIE, { email }, req);
            redirectTo(res, '/resetConfirmation');
        } else {
            updateSession(
                FORGOT_PASSWORD_COOKIE,
                {
                    email,
                    error: 'Invalid email format - Enter a valid email address',
                },
                req,
            );
            redirectTo(res, '/forgotPassword');
        }
    } catch (error) {
        const message = 'There was a problem with requesting a password reset.';
        redirectToError(res, message, error);
    }
};
