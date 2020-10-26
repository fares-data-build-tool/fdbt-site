import { NextApiResponse } from 'next';
import { redirectToError, redirectOnFareType, getAndValidateSchemeOp, redirectTo } from './apiUtils';
import { isSessionValid } from './apiUtils/validator';
import { NextApiRequestWithSession } from '../../interfaces';
import { updateSessionAttribute } from '../../utils/sessions';
import { FARE_TYPE_ATTRIBUTE, TICKET_REPRESENTATION_ATTRIBUTE } from '../../constants';

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
        }
        const schemeOperator = getAndValidateSchemeOp(req, res);
        if (schemeOperator) {
            updateSessionAttribute(req, FARE_TYPE_ATTRIBUTE, { fareType: 'multiOperator' });
            updateSessionAttribute(req, TICKET_REPRESENTATION_ATTRIBUTE, { name: 'geoZone' });
            redirectTo(res, '/csvZoneUpload');
        }
        redirectOnFareType(req, res);
    } catch (error) {
        const message = 'There was a problem redirecting the user from the fare confirmation page:';
        redirectToError(res, message, 'api.fareConfirmation', error);
    }
};
