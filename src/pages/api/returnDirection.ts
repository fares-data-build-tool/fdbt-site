import { NextApiResponse } from 'next';
import { NextRequestWithSession } from '../../interfaces';
import { getUuidFromCookie } from '../../utils';
import { redirectTo, redirectToError, setCookieOnResponseObject } from './apiUtils';
import { isSessionValid } from './service/validator';
import { JOURNEY_ATTRIBUTE } from '../../constants';
import { inboundErrorId, outboundErrorId } from '../returnDirection';

export default (req: NextRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const { inboundJourney, outboundJourney } = req.body;

        if (inboundJourney && outboundJourney) {
            const uuid = getUuidFromCookie(req, res);

            if (!uuid) {
                throw new Error('No UUID found');
            }

            const cookieValue = JSON.stringify({ errorMessages: [], inboundJourney, outboundJourney, uuid });
            setCookieOnResponseObject(req, res, JOURNEY_ATTRIBUTE, cookieValue);
            redirectTo(res, '/inputMethod');
        } else {
            const errorMessages: object[] = [];

            if (!inboundJourney) {
                errorMessages.push({ errorMessage: 'Choose an option for an inbound journey', id: inboundErrorId });
            }

            if (!outboundJourney) {
                errorMessages.push({ errorMessage: 'Choose an option for an outbound journey', id: outboundErrorId });
            }

            const cookieValue = JSON.stringify({ errorMessages, inboundJourney, outboundJourney });
            setCookieOnResponseObject(req, res, JOURNEY_ATTRIBUTE, cookieValue);
            redirectTo(res, '/returnDirection');
        }
    } catch (error) {
        const message = 'There was a problem selecting the directions:';
        redirectToError(res, message, error);
    }
};
