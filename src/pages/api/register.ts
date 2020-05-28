import { NextApiRequest, NextApiResponse } from 'next';
import Auth from '@aws-amplify/auth';
import { getDomain, redirectTo, redirectToError, setCookieOnResponseObject } from './apiUtils';
import { USER_COOKIE } from '../../constants';
import { InputCheck } from '../register';
import { getServicesByNocCode } from '../../data/auroradb';

const checkEmailValid = (email: string) => {
    const emailRegex = new RegExp('^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$');
    return emailRegex.test(email) && email !== '';
};

const validatePassword = (password: string, confirmPassword: string): string => {
    let passwordErrorMessage = '';

    if (password.length < 8) {
        passwordErrorMessage = 'Password cannot be empty or less than 8 characters';
    } else if (confirmPassword !== password) {
        passwordErrorMessage = 'Passwords do not match';
    }

    return passwordErrorMessage;
};

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const setErrorsCookie = (inputChecks: InputCheck[], regKey: string) => {
        const cookieContent = JSON.stringify({ inputChecks });
        setCookieOnResponseObject(getDomain(req), USER_COOKIE, cookieContent, req, res);
        redirectTo(res, `/register?key=${regKey}`);
    };

    try {
        const { email, password, confirmPassword, nocCode, regKey } = req.body;

        const inputChecks: InputCheck[] = [];

        const emailValid = checkEmailValid(email);

        inputChecks.push({
            inputValue: !emailValid ? '' : email,
            id: 'email',
            error: !emailValid ? 'Enter an email address in the correct format, like name@example.com' : '',
        });

        inputChecks.push({
            inputValue: '',
            id: 'password',
            error: validatePassword(password, confirmPassword),
        });

        inputChecks.push({
            inputValue: nocCode,
            id: 'nocCode',
            error: nocCode === '' ? 'NOC Code cannot be empty' : '',
        });

        const servicesForNoc = await getServicesByNocCode(nocCode);

        if (servicesForNoc.length === 0) {
            inputChecks.push({
                inputValue: nocCode,
                id: 'nocCode',
                error: nocCode === '' ? 'There was a problem logging you in' : '',
            });
        }

        if (inputChecks.some(el => el.error !== '')) {
            setErrorsCookie(inputChecks, regKey);
            return;
        }

        try {
            const user = await Auth.signIn(email, regKey);

            if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
                await Auth.completeNewPassword(user, password, { 'custom:test-noc': nocCode });
                await Auth.signOut({ global: true });
                redirectTo(res, '/confirmRegister');
            }
        } catch (error) {
            inputChecks.push({
                inputValue: '',
                id: 'email',
                error: 'There was a problem creating your account',
            });

            setErrorsCookie(inputChecks, regKey);
        }
    } catch (error) {
        const message = 'There was a problem with the creation of the account';
        redirectToError(res, message, error);
    }
};
