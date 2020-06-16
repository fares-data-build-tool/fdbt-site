import Cookies from 'cookies';
import { NextApiRequest, NextApiResponse } from 'next';
import { decode } from 'jsonwebtoken';
import { redirectToError, redirectTo, signOutUser } from './apiUtils';
import { ID_TOKEN_COOKIE } from '../../constants';
import { CognitoIdToken } from '../../interfaces';

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        const cookies = new Cookies(req, res);
        const idToken = cookies.get(ID_TOKEN_COOKIE) ?? null;
        if (!idToken) {
            redirectTo(res, '/login');
            return;
        }
        const decodedToken = decode(idToken) as CognitoIdToken;

        const username = decodedToken?.['cognito:username'] ?? null;

        await signOutUser(username, req, res)
            .then(() => redirectTo(res, '/'))
            .catch(error => {
                console.error(`failed to sign out user: ${error.stack}`);
                redirectTo(res, '/');
            });
    } catch (error) {
        const message = 'There was a problem signing out of your account';
        redirectToError(res, message, error);
    }
};
