import { NextApiRequest, NextApiResponse } from 'next';
import { getDomain, redirectTo, redirectToError, setCookieOnResponseObject } from './apiUtils';
import { USER_COOKIE } from '../../constants';
import { InputCheck } from '../register';

const checkEmailValid = (email: string) => {
    const emailRegex = new RegExp('^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$');
    return emailRegex.test(email) && email !== '';
};

const validatePassword = (password: string, confirmPassword: string) => {
    let passwordErrorMessage = '';

    if (password.length < 8) {
        passwordErrorMessage = 'Password cannot be empty or less than 8 characters';
    } else if (confirmPassword !== password) {
        passwordErrorMessage = 'Passwords do not match';
    }

    return passwordErrorMessage;
};

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        const { email, password, confirmPassword, nocCode } = req.body;
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

        if (inputChecks.some(el => el.error !== '')) {
            const cookieContent = JSON.stringify({ inputChecks });
            setCookieOnResponseObject(getDomain(req), USER_COOKIE, cookieContent, req, res);
            redirectTo(res, '/register');
        } else {
            redirectTo(res, '/somewhere');
        }

        // if above valid then we need to call cognito and chheck email and noc code
    } catch (error) {
        const message = 'There was a problem with the creation of the account';
        redirectToError(res, message, error);
    }
};
