import { NextApiResponse } from 'next';
import { NextRequestWithSession } from '../../interfaces';
import { setCookieOnResponseObject, getUuidFromCookie } from '../../utils';
import { redirectTo, redirectToError } from '../../utils/redirects';
import { JOURNEY_COOKIE } from '../../constants/index';
import { isSessionValid } from './service/validator';

export default (req: NextRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const { directionJourneyPattern } = req.body;

        if (!directionJourneyPattern) {
            const cookieValue = JSON.stringify({ errorMessage: 'Choose a direction from the options' });
            setCookieOnResponseObject(req, res, JOURNEY_COOKIE, cookieValue);
            redirectTo(res, '/singleDirection');
            return;
        }

        const uuid = getUuidFromCookie(req, res);

        if (!uuid) {
            throw new Error('No UUID found');
        }

        const cookieValue = JSON.stringify({ directionJourneyPattern, uuid });
        setCookieOnResponseObject(req, res, JOURNEY_COOKIE, cookieValue);

        redirectTo(res, '/inputMethod');
    } catch (error) {
        const message = 'There was a problem selecting the direction:';
        redirectToError(res, message, error);
    }
};
