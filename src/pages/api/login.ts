import { NextApiResponse } from 'next';
import { decode } from 'jsonwebtoken';
import { checkEmailValid } from '../../utils';
import { updateSessionAttribute } from '../../utils/sessions';
import { redirectTo, redirectToError } from '../../utils/redirects';
import { OPERATOR_COOKIE, ID_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../../constants';
import { CognitoIdToken, NextRequestWithSession } from '../../interfaces';
import { getOperatorNameByNocCode } from '../../data/auroradb';
import { initiateAuth } from '../../data/cognito';

export default async (req: NextRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!checkEmailValid(email)) {
            updateSessionAttribute(req, OPERATOR_COOKIE, {
                id: 'email',
                errorMessage: 'Enter an email address in the correct format, like name@example.com',
            });
            redirectTo(res, '/login');

            return;
        }

        if (!password) {
            updateSessionAttribute(req, OPERATOR_COOKIE, {
                id: 'password',
                errorMessage: 'Enter a password',
            });
            redirectTo(res, '/login');

            return;
        }

        try {
            const authResponse = await initiateAuth(email, password);

            if (authResponse?.AuthenticationResult) {
                const refreshToken = authResponse.AuthenticationResult.RefreshToken as string;
                const idToken = authResponse.AuthenticationResult.IdToken as string;
                const decodedIdToken = decode(idToken) as CognitoIdToken;
                const nocCode = decodedIdToken['custom:noc'];
                const operatorName = await getOperatorNameByNocCode(nocCode);

                updateSessionAttribute(req, OPERATOR_COOKIE, { operator: operatorName });
                updateSessionAttribute(req, ID_TOKEN_COOKIE, { idToken });
                updateSessionAttribute(req, REFRESH_TOKEN_COOKIE, { refreshToken });

                console.info('login successful', { noc: nocCode });
                redirectTo(res, '/fareType');
            } else {
                throw new Error('Auth response invalid');
            }
        } catch (error) {
            console.warn('login failed', { error: error.message });
            updateSessionAttribute(req, OPERATOR_COOKIE, {
                id: 'login',
                errorMessage: 'The email address and/or password are not correct.',
            });
            redirectTo(res, '/login');
        }
    } catch (error) {
        const message = 'There was a problem signing into your account';
        redirectToError(res, message, error);
    }
};
