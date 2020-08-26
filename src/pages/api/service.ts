import { NextApiResponse } from 'next';
import { getUuidFromCookie, setCookieOnResponseObject, redirectToError, redirectTo } from './apiUtils/index';
import { FARE_TYPE_ATTRIBUTE, SERVICE_COOKIE } from '../../constants/index';
import { isSessionValid } from './apiUtils/validator';
import { getSessionAttribute } from '../../utils/sessions';
import { isFareType } from './apiUtils/typeChecking';
import { NextApiRequestWithSession } from '../../interfaces';

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
        }
        const { service } = req.body;

        if (!service) {
            const cookieValue = JSON.stringify({ errorMessage: 'Choose a service from the options' });
            setCookieOnResponseObject(SERVICE_COOKIE, cookieValue, req, res);
            redirectTo(res, '/service');
            return;
        }

        const uuid = getUuidFromCookie(req, res);

        if (!uuid) {
            throw new Error('No UUID found');
        }

        const cookieValue = JSON.stringify({ service, uuid });
        setCookieOnResponseObject(SERVICE_COOKIE, cookieValue, req, res);

        const fareTypeAttribute = getSessionAttribute(req, FARE_TYPE_ATTRIBUTE);

        if (fareTypeAttribute && isFareType(fareTypeAttribute) && fareTypeAttribute.fareType === 'return') {
            redirectTo(res, '/returnDirection');
            return;
        }

        redirectTo(res, '/singleDirection');
    } catch (error) {
        const message = 'There was a problem selecting the service:';
        redirectToError(res, message, 'api.service', error);
    }
};
