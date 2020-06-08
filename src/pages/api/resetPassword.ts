import { NextApiRequest, NextApiResponse } from 'next';
import Auth from '../../data/amplify';
import { getDomain, redirectTo, redirectToError, setCookieOnResponseObject } from './apiUtils';
import { USER_COOKIE } from '../../constants';
import { InputCheck } from '../register';

const validatePassword = (password: string, confirmPassword: string): string => {
    let passwordErrorMessage = '';

    console.log('password errors', password, confirmPassword);
    if (password.length < 8) {
        passwordErrorMessage = 'Password cannot be empty or less than 8 characters';
    } else if (confirmPassword !== password) {
        passwordErrorMessage = 'Passwords do not match';
    }

    return passwordErrorMessage;
};

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const setErrorsCookie = (inputChecks: InputCheck[], regKey: string, username: string, expiry: string): void => {
        const cookieContent = JSON.stringify({ inputChecks });
        setCookieOnResponseObject(getDomain(req), USER_COOKIE, cookieContent, req, res);
        redirectTo(res, `/resetPassword?key=${regKey}&user_name=${username}&expiry=${expiry}`);
    };

    try {
        const { username, password, confirmPassword, regKey, expiry } = req.body;

        console.log('req boyds', req.body);
        const inputChecks: InputCheck[] = [];

        if (!username || !regKey) {
            inputChecks.push({
                inputValue: '',
                id: 'password',
                error: 'There was a problem resetting your password.',
            });
        }

        inputChecks.push({
            inputValue: '',
            id: 'password',
            error: validatePassword(password, confirmPassword),
        });

        if (inputChecks.some(el => el.error !== '')) {
            setErrorsCookie(inputChecks, regKey, username, expiry);
            return;
        }

        try {
            await Auth.forgotPasswordSubmit(username, regKey, password);
            redirectTo(res, '/resetPasswordSuccess');
        } catch (error) {
            if (error.code === 'ExpiredCodeException') {
                redirectTo(res, '/resetLinkExpired');
            }
            console.warn('reset password failed', { error: error.message });
            inputChecks.push({
                inputValue: '',
                id: 'email',
                error: 'There was a problem creating your account',
            });

            setErrorsCookie(inputChecks, regKey, username, expiry);
        }
    } catch (error) {
        const message = 'There was a problem with the creation of the account';
        redirectToError(res, message, error);
    }
};
