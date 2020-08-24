import { NextApiRequest, NextApiResponse } from 'next';
import { isArray } from 'lodash';
import { redirectTo, redirectToError, setCookieOnResponseObject, checkEmailValid } from './apiUtils';
import { USER_COOKIE } from '../../constants';
import { InputCheck } from '../../interfaces';
import { getServicesByNocCode } from '../../data/auroradb';
import { initiateAuth, globalSignOut, updateUserAttributes, respondToNewPasswordChallenge } from '../../data/cognito';
import logger from '../../utils/logger';

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
    const setErrorsCookie = (inputChecks: InputCheck[], regKey: string): void => {
        const cookieContent = JSON.stringify({ inputChecks });
        setCookieOnResponseObject(USER_COOKIE, cookieContent, req, res);
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

        if (nocCode !== '' && nocCode !== 'IWBusCo') {
            const servicesForNoc = await getServicesByNocCode(nocCode);

            if (servicesForNoc.length === 0) {
                logger.warn('', {
                    context: 'api.register',
                    message: 'NOC not found in database',
                    nocCode,
                });

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

            if (ChallengeName === 'NEW_PASSWORD_REQUIRED' && ChallengeParameters?.userAttributes && Session) {
                const parameters = JSON.parse(ChallengeParameters.userAttributes);

                const cognitoNocs: string[] = parameters['custom:noc'].split('|');

                let valid = false;

                if (isArray(cognitoNocs)) {
                    valid = cognitoNocs.includes(nocCode);
                } else {
                    valid = cognitoNocs === nocCode;
                }

                if (cognitoNocs.length === 0 || !valid) {
                    logger.warn('', {
                        context: 'api.register',
                        message: 'NOC does not match',
                        inputtedNoc: nocCode,
                        requiredNoc: parameters['custom:noc'] || '',
                    });

                    throw new Error('NOC does not match');
                }

                await respondToNewPasswordChallenge(ChallengeParameters.USER_ID_FOR_SRP, password, Session);
                await updateUserAttributes(email, [{ Name: 'custom:contactable', Value: contactable }]);
                await globalSignOut(email);

                logger.info('', {
                    context: 'api.register',
                    message: 'registration successful',
                    noc: nocCode,
                });

                redirectTo(res, '/confirmRegistration');
            } else {
                throw new Error(`unexpected challenge: ${ChallengeName}`);
            }
        } catch (error) {
            logger.error(error, {
                context: 'api.register',
                message: 'registration failed',
            });

            inputChecks.push({
                inputValue: '',
                id: 'email',
                error: 'There was a problem creating your account',
            });

            setErrorsCookie(inputChecks, regKey);
        }
    } catch (error) {
        const message = 'There was a problem with the creation of the account';
        redirectToError(res, message, 'api.register', error);
    }
};
