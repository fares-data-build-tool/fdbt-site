import { NextApiResponse } from 'next';
import { NextRequestWithSession } from '../../interfaces';
import { checkEmailValid } from '../../utils';
import { updateSessionAttribute } from '../../utils/sessions';
import { redirectTo, redirectToError } from '../../utils/redirects';
import { FORGOT_PASSWORD_COOKIE } from '../../constants/index';

import { forgotPassword } from '../../data/cognito';

export default async (req: NextRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email || !email.trim().length) {
            updateSessionAttribute(req, FORGOT_PASSWORD_COOKIE, { email, error: 'Enter your email address' });
            redirectTo(res, '/forgotPassword');
            return;
        }

        if (checkEmailValid(email)) {
            await forgotPassword(email);
            updateSessionAttribute(req, FORGOT_PASSWORD_COOKIE, { email });
            redirectTo(res, '/resetConfirmation');
        } else {
            updateSessionAttribute(req, FORGOT_PASSWORD_COOKIE, {
                email,
                error: 'Invalid email format - Enter a valid email address',
            });
            redirectTo(res, '/forgotPassword');
        }
    } catch (error) {
        const message = 'There was a problem with requesting a password reset.';
        redirectToError(res, message, error);
    }
};
