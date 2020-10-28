import { NextApiResponse } from 'next';
import { redirectToError, redirectOnFareType, getAndValidateSchemeOpRegion, redirectTo } from './apiUtils';
import { isSessionValid } from './apiUtils/validator';
import { NextApiRequestWithSession } from '../../interfaces';

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
        }
        const schemeOpRegion = getAndValidateSchemeOpRegion(req, res);
        if (schemeOpRegion) {
            redirectTo(res, '/csvZoneUpload');
        }
        redirectOnFareType(req, res);
    } catch (error) {
        const message = 'There was a problem redirecting the user from the fare confirmation page:';
        redirectToError(res, message, 'api.fareConfirmation', error);
    }
};
