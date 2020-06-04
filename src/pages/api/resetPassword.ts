import { NextApiRequest, NextApiResponse } from 'next';
import Auth from '../../data/amplify';
import { getDomain, redirectTo, redirectToError, setCookieOnResponseObject } from './apiUtils';
import { USER_COOKIE } from '../../constants';
import { InputCheck } from '../register';

const validatePassword = (password: string, confirmPassword: string): string => {
    let passwordErrorMessage = '';

    console.log('valdiate', confirmPassword, password);
    if (password.length < 8) {
        passwordErrorMessage = 'Password cannot be empty or less than 8 characters';
    } else if (confirmPassword !== password) {
        passwordErrorMessage = 'Passwords do not match';
    }

    return passwordErrorMessage;
};

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const setErrorsCookie = (inputChecks: InputCheck[], regKey: string, username: string): void => {
        const cookieContent = JSON.stringify({ inputChecks });
        setCookieOnResponseObject(getDomain(req), USER_COOKIE, cookieContent, req, res);
        redirectTo(res, `/resetPassword?key=${regKey}&user_name=${username}`);
    };

    try {
        const { username, password, confirmPassword, regKey } = req.body;

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
            setErrorsCookie(inputChecks, regKey, username);
            return;
        }

        try {
            const user = await Auth.forgotPasswordSubmit(username, regKey, password);

            console.log('user====', user);

            // if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
            //     await Auth.completeNewPassword(user, password, { 'custom:noc': nocCode });
            //     await Auth.signOut({ global: true });
            //     console.info('registration successful', { noc: nocCode });
            //     redirectTo(res, '/confirmRegistration');
            // } else {
            //     throw new Error(`unexpected challenge: ${user.challengeName}`);
            // }
        } catch (error) {
            if(error.code === 'ExpiredCodeException') {

            }
            console.log('error', error);
            console.warn('reset password failed', { error: error.message });
            inputChecks.push({
                inputValue: '',
                id: 'email',
                error: 'There was a problem creating your account',
            });

            setErrorsCookie(inputChecks, regKey, username);
        }
    } catch (error) {
        const message = 'There was a problem with the creation of the account';
        redirectToError(res, message, error);
    }
};
