import { NextApiResponse } from 'next';
import { getUuidFromSession, redirectTo, redirectToError } from './apiUtils/index';
import { JOURNEY_ATTRIBUTE } from '../../constants/attributes';
import { inboundErrorId, outboundErrorId } from '../returnDirection';
import { updateSessionAttribute } from '../../utils/sessions';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        const { inboundJourney, outboundJourney } = req.body;

        if (inboundJourney && outboundJourney) {
            const uuid = getUuidFromSession(req);

            if (!uuid) {
                throw new Error('No UUID found');
            }

            updateSessionAttribute(req, JOURNEY_ATTRIBUTE, { inboundJourney, outboundJourney });
            redirectTo(res, '/inputMethod');
        } else {
            const errors: ErrorInfo[] = [];

            if (!outboundJourney) {
                errors.push({ errorMessage: 'Choose an option for an outbound journey', id: outboundErrorId });
            }

            if (!inboundJourney) {
                errors.push({ errorMessage: 'Choose an option for an inbound journey', id: inboundErrorId });
            }

            updateSessionAttribute(req, JOURNEY_ATTRIBUTE, { errors, inboundJourney, outboundJourney });
            redirectTo(res, '/returnDirection');
        }
    } catch (error) {
        const message = 'There was a problem selecting the directions:';
        redirectToError(res, message, 'api.returnDirection', error);
    }
};
