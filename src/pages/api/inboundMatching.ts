import { NextApiResponse } from 'next';
import { redirectTo, redirectToError, getSelectedStages } from './apiUtils';
import { NextApiRequestWithSession } from '../../interfaces';
import { UserFareStages } from '../../data/s3';
import { isCookiesUUIDMatch, isSessionValid } from './service/validator';
import { getMatchingFareZonesFromForm, isFareStageUnassigned } from './apiUtils/matching';
import { INBOUND_MATCHING_ATTRIBUTE } from '../../constants';
import { updateSessionAttribute } from '../../utils/sessions';
import { MatchingWithErrors, InboundMatching } from '../../interfaces/matchingInterface';

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (!isCookiesUUIDMatch(req, res)) {
            throw new Error('Cookie UUIDs do not match');
        }

        if (!req.body.service || !req.body.userfarestages) {
            throw new Error('No service or userfarestages info found');
        }

        const inboundUserFareStages: UserFareStages = JSON.parse(req.body.userfarestages);

        const inboundMatchingFareZones = getMatchingFareZonesFromForm(req);

        // Deleting these keys from the object in order to faciliate looping through the fare stage values in the body
        delete req.body.service;
        delete req.body.userfarestages;

        if (isFareStageUnassigned(inboundUserFareStages, inboundMatchingFareZones) && inboundMatchingFareZones !== {}) {
            const selectedStagesList: string[] = getSelectedStages(req);
            const matchingAttributeError: MatchingWithErrors = { error: true, selectedFareStages: selectedStagesList };
            updateSessionAttribute(req, INBOUND_MATCHING_ATTRIBUTE, matchingAttributeError);
            redirectTo(res, '/inboundMatching');
            return;
        }
        const matchingAttributeValue: InboundMatching = { inboundUserFareStages, inboundMatchingFareZones };
        updateSessionAttribute(req, INBOUND_MATCHING_ATTRIBUTE, matchingAttributeValue);
        redirectTo(res, '/selectSalesOfferPackage');
    } catch (error) {
        const message = 'There was a problem generating the matching JSON.';
        redirectToError(res, message, error);
    }
};
