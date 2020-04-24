import { NextApiRequest, NextApiResponse } from 'next';
import { getDomain, setCookieOnResponseObject, redirectTo, redirectToError } from './apiUtils/index';
import { isSessionValid } from './service/validator';
import { JOURNEY_COOKIE } from '../../constants';
import { inboundErrorId, outboundErrorId } from '../selectJourneyDirection';

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        console.log('req', req.body);
        if (req.body.inboundJourney && req.body.outboundJourney) {
            console.log('what');
        } else {
            const { inboundJourney, outboundJourney } = req.body;
            console.log('req', req.body);
            const errorMessages: object[] = [];

            if (!inboundJourney) {
                errorMessages.push({ errorMessage: 'Choose an option for an inbound journey', id: inboundErrorId });
            }

            if (!outboundJourney) {
                errorMessages.push({ errorMessage: 'Choose an option for an outbound journey', id: outboundErrorId });
            }

            const cookieValue = JSON.stringify({errorMessages, inboundJourney, outboundJourney});
            console.log('cookie value===', cookieValue);
            setCookieOnResponseObject(getDomain(req), JOURNEY_COOKIE, cookieValue, req, res);
            redirectTo(res, '/selectJourneyDirection');
        }
        //     const { periodType } = req.body;
        //     const uuid = getUuidFromCookie(req, res);
        //     const periodTypeObject = { periodTypeName: periodType, uuid };
        //     setCookieOnResponseObject(getDomain(req), PERIOD_TYPE, JSON.stringify(periodTypeObject), req, res);
        //
        //     switch (periodType) {
        //         case 'periodGeoZone':
        //             redirectTo(res, '/csvZoneUpload');
        //             return;
        //         case 'periodMultipleServices':
        //             redirectTo(res, '/singleOperator?selectAll=false');
        //             return;
        //         case 'periodMultipleOperators':
        //             // redirect to page not made yet
        //             return;
        //         default:
        //             throw new Error('Type of period we expect was not received.');
        //     }
        // } else {
        //     const cookieValue = JSON.stringify({
        //         errorMessage: 'Choose an option regarding your period ticket type',
        //     });
        //     setCookieOnResponseObject(getDomain(req), PERIOD_TYPE, cookieValue, req, res);
        //     redirectTo(res, '/periodType');
        // }

        // const { journeyPattern } = req.body;
        // const fareTypeCookie = JSON.parse(req.cookies[FARETYPE_COOKIE]).fareType;

        return;
        // if (!journeyPattern || !fareTypeCookie) {
        //     redirectTo(res, '/direction');
        //     return;
        // }
        //
        // const uuid = getUuidFromCookie(req, res);
        //
        // if (!uuid) {
        //     throw new Error('No UUID found');
        // }
        //
        // const cookieValue = JSON.stringify({ journeyPattern, uuid });
        // setCookieOnResponseObject(getDomain(req), JOURNEY_COOKIE, cookieValue, req, res);
        //
        // redirectTo(res, '/inputMethod');
    } catch (error) {
        const message = 'There was a problem selecting the direction:';
        redirectToError(res, message, error);
    }
};
