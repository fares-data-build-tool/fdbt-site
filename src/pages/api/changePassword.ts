import { NextApiRequest, NextApiResponse } from 'next';
import { ErrorInfo } from '../../interfaces';
import { getDomain, redirectTo, redirectToError, setCookieOnResponseObject, getAttributeFromIdToken } from './apiUtils';
import { USER_COOKIE } from '../../constants';
import { initiateAuth, updateUserPassword } from '../../data/cognito';

// Move below into api utils? (Currently used in both resetPassword and here in changePassword)

const validatePassword = (password: string, confirmPassword: string, inputChecks: ErrorInfo[]): ErrorInfo[] => {
    let passwordError = '';
    if (password.length < 8) {
        passwordError = password.length === 0 ? 'Enter a new password' : 'Password must be at least 8 characters long';
    } else if (password !== confirmPassword) {
        passwordError = 'Passwords do not match';
        inputChecks.push({ id: 'confirm-new-password', errorMessage: passwordError });
    }
    inputChecks.push({ id: 'new-password', errorMessage: passwordError });
    return inputChecks;
};

export const setCookieAndRedirect = (req: NextApiRequest, res: NextApiResponse, inputChecks: ErrorInfo[]): void => {
    const cookieContent = JSON.stringify({ inputChecks });
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

        let inputChecks: ErrorInfo[] = [];

        if (!oldPassword) {
            inputChecks.push({ id: 'old-password', errorMessage: 'Enter your current password' });
            inputChecks = validatePassword(newPassword, confirmNewPassword, inputChecks);
            setCookieAndRedirect(req, res, inputChecks);
            return;
        }

        try {
            const authResponse = await initiateAuth(username, oldPassword);

            if (authResponse?.AuthenticationResult) {
                inputChecks = validatePassword(newPassword, confirmNewPassword, inputChecks);

                if (inputChecks.some(el => el.errorMessage !== '')) {
                    setCookieAndRedirect(req, res, inputChecks);
                    return;
                }

                try {
                    await updateUserPassword(newPassword, username);
                    redirectTo(res, '/passwordUpdated');
                } catch (error) {
                    console.warn('update password failed', { error: error?.message });
                    inputChecks.push({
                        id: 'new-password',
                        errorMessage: 'There was a problem resetting your password.',
                    });
                    setCookieAndRedirect(req, res, inputChecks);
                }
            } else {
                throw new Error('Auth response invalid');
            }
        } catch (error) {
            console.warn('User authentication failed', { error: error.message });
            inputChecks.push({
                id: 'old-password',
                errorMessage: 'Your old password is incorrect.',
            });
            setCookieAndRedirect(req, res, inputChecks);
        }
    } catch (error) {
        const message = 'There was an error updating the user password';
        redirectToError(res, message, error);
    }
};
