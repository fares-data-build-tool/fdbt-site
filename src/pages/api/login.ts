import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import Auth from '../../data/amplify';
import { getDomain, redirectTo, redirectToError, setCookieOnResponseObject } from './apiUtils';
import { OPERATOR_COOKIE } from '../../constants';
import { InputCheck } from '../login';
import { getOperatorNameByNocCode } from '../../data/auroradb';

const checkEmailValid = (email: string): boolean => {
    const emailRegex = new RegExp('^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$');
    return emailRegex.test(email) && email !== '';
};

const validatePassword = (password: string): string => {
    let passwordErrorMessage = '';

    if (password.length < 8) {
        passwordErrorMessage = 'Password cannot be empty or less than 8 characters';
    }

    return passwordErrorMessage;
};

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const setErrorsCookie = (inputChecks: InputCheck[]): void => {
        const cookieContent = JSON.stringify({ inputChecks });
        setCookieOnResponseObject(getDomain(req), OPERATOR_COOKIE, cookieContent, req, res);
        redirectTo(res, '/login');
    };

    try {
        const { email, password } = req.body;

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
            error: validatePassword(password),
        });

        if (inputChecks.some(el => el.error !== '')) {
            setErrorsCookie(inputChecks);
            return;
        }

        try {
            const user = await Auth.signIn(email, password);

            if (user) {
                const nocCode = user.attributes['custom:noc'];
                const operatorName = await getOperatorNameByNocCode(nocCode);
                const uuid = uuidv4();
                const cookieValue = JSON.stringify({ operator: operatorName, uuid, nocCode });
                setCookieOnResponseObject(getDomain(req), OPERATOR_COOKIE, cookieValue, req, res);
                console.info('login successful', { noc: nocCode });
                redirectTo(res, '/fareType');
            } else {
                throw new Error('User object not returned by Cognito');
            }
        } catch (error) {
            console.warn('login failed', { error: error.message });
            inputChecks.push({
                inputValue: '',
                id: 'email',
                error: 'There was a problem signing into your account',
            });

            setErrorsCookie(inputChecks);
        }
    } catch (error) {
        const message = 'There was a problem signing into your account';
        redirectToError(res, message, error);
    }
};
