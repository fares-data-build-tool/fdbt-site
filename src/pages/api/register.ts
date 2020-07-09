import { NextApiResponse } from 'next';
import { NextRequestWithSession, InputCheck } from '../../interfaces';
import { checkEmailValid } from '../../utils';
import { redirectTo, redirectToError, setCookieOnResponseObject } from './apiUtils';
import { USER_COOKIE } from '../../constants';
import { getServicesByNocCode } from '../../data/auroradb';
import { initiateAuth, respondToNewPasswordChallenge, globalSignOut, updateUserAttributes } from '../../data/cognito';

const validatePassword = (password: string, confirmPassword: string): string => {
    let passwordErrorMessage = '';

    if (password.length < 8) {
        passwordErrorMessage = 'Password cannot be empty or less than 8 characters';
    } else if (confirmPassword !== password) {
        passwordErrorMessage = 'Passwords do not match';
    }

    return passwordErrorMessage;
};

export default async (req: NextRequestWithSession, res: NextApiResponse): Promise<void> => {
    const setErrorsCookie = (inputChecks: InputCheck[], regKey: string): void => {
        const cookieContent = JSON.stringify({ inputChecks });
        setCookieOnResponseObject(req, res, USER_COOKIE, cookieContent);
        redirectTo(res, `/register?key=${regKey}`);
    };

    try {
        const { email, password, confirmPassword, nocCode, regKey } = req.body;

        let { contactable } = req.body;

        if (!contactable) {
            contactable = 'no';
        }

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
            id: 'noc-code',
            error: nocCode === '' ? 'National Operator Code cannot be empty' : '',
        });

        if (nocCode !== '') {
            const servicesForNoc = await getServicesByNocCode(nocCode);

            if (servicesForNoc.length === 0) {
                inputChecks.push({
                    inputValue: '',
                    id: 'email',
                    error: 'There was a problem creating your account',
                });
            }
        }

        if (inputChecks.some(el => el.error !== '')) {
            setErrorsCookie(inputChecks, regKey);
            return;
        }

        try {
            const { ChallengeName, ChallengeParameters, Session } = await initiateAuth(email, regKey);

            if (ChallengeName === 'NEW_PASSWORD_REQUIRED' && ChallengeParameters && Session) {
                await respondToNewPasswordChallenge(ChallengeParameters.USER_ID_FOR_SRP, password, Session);
                await updateUserAttributes(email, [
                    { Name: 'custom:noc', Value: nocCode },
                    { Name: 'custom:contactable', Value: contactable },
                ]);
                await globalSignOut(email);

                console.info('Registration Successful', { noc: nocCode, contactable });
                redirectTo(res, '/confirmRegistration');
            } else {
                throw new Error(`unexpected challenge: ${ChallengeName}`);
            }
        } catch (error) {
            console.warn('Registration Failed', { error: error.message });
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
