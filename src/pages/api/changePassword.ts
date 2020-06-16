import { NextApiRequest, NextApiResponse } from 'next';
import { ErrorInfo } from '../../interfaces';
import { getDomain, redirectTo, redirectToError, setCookieOnResponseObject, getAttributeFromIdToken } from './apiUtils';
import { USER_COOKIE } from '../../constants';
import { initiateAuth, updateUserPassword } from '../../data/cognito';

// Move below into api utils? (Currently used in both resetPassword and here in changePassword)

const validatePassword = (password: string, confirmPassword: string): ErrorInfo[] => {
    const errors: ErrorInfo[] = [];
    let passwordError = '';
    if (password.length < 8) {
        passwordError = 'Password must be at least 8 characters long';
    } else if (password !== confirmPassword) {
        passwordError = 'Passwords do not match';
    }
    errors.push({ id: 'new-password', errorMessage: passwordError });
    return errors;
};

export const setCookieAndRedirect = (req: NextApiRequest, res: NextApiResponse, errors: ErrorInfo[]): void => {
    const cookieContent = JSON.stringify({ errors });
    setCookieOnResponseObject(getDomain(req), USER_COOKIE, cookieContent, req, res);
    redirectTo(res, '/changePassword');
};

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const username = getAttributeFromIdToken(req, res, 'email');
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        if (!username) {
            throw new Error('Could not retrieve email from ID_TOKEN_COOKIE');
        }

        let errors: ErrorInfo[] = [];

        try {
            const authResponse = await initiateAuth(username, oldPassword);

            if (authResponse?.AuthenticationResult) {
                errors = validatePassword(newPassword, confirmNewPassword);

                if (errors.some(el => el.errorMessage !== '')) {
                    setCookieAndRedirect(req, res, errors);
                    return;
                }

                try {
                    await updateUserPassword(newPassword, username);
                    redirectTo(res, '/passwordChanged');
                } catch (error) {
                    console.warn('update password failed', { error: error?.message });
                    errors.push({
                        id: 'new-password',
                        errorMessage: 'There was a problem resetting your password.',
                    });
                    setCookieAndRedirect(req, res, errors);
                }
            } else {
                throw new Error('Auth response invalid');
            }
        } catch (error) {
            console.warn('User authentication failed', { error: error.message });
            errors.push({
                id: 'old-password',
                errorMessage: 'Your old password is incorrect.',
            });
            setCookieAndRedirect(req, res, errors);
        }
    } catch (error) {
        const message = 'There was an error updating the user password';
        redirectToError(res, message, error);
    }
};
