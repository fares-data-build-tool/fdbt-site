import { NextApiResponse } from 'next';
import { getAttributeFromIdToken } from '../../utils';
import { redirectToError, redirectTo, signOutUser } from './apiUtils';
import { NextRequestWithSession } from '../../interfaces';

export default async (req: NextRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const username = getAttributeFromIdToken(req, 'cognito:username');

        try {
            await signOutUser(username, req, res);
            redirectTo(res, '/');
        } catch (error) {
            console.error(`failed to sign out user: ${error.stack}`);
            redirectTo(res, '/');
        }
    } catch (error) {
        const message = 'There was a problem signing out of your account';
        redirectToError(res, message, error);
    }
};
