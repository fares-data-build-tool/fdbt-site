import { NextApiResponse } from 'next';
import { redirectTo, redirectToError, getSelectedStages } from './apiUtils';
import { UserFareStages } from '../../data/s3';
import { isCookiesUUIDMatch, isSessionValid } from './service/validator';
import { MATCHING_ATTRIBUTE } from '../../constants';
import { MatchingFareZones } from '../../interfaces/matchingInterface';
import { getFareZones, getMatchingFareZonesFromForm, isFareStageUnassigned } from './apiUtils/matching';
import { updateSessionAttribute } from '../../utils/sessions';
import { NextApiRequestWithSession } from '../../interfaces';

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

        const userFareStages: UserFareStages = JSON.parse(req.body.userfarestages);

        const matchingFareZones = getMatchingFareZonesFromForm(req);

        // Deleting these keys from the object in order to faciliate looping through the fare stage values in the body
        delete req.body.service;
        delete req.body.userfarestages;

        if (isFareStageUnassigned(userFareStages, matchingFareZones) && matchingFareZones !== {}) {
            const selectedStagesList: {}[] = getSelectedStages(req);

            updateSessionAttribute(req, MATCHING_ATTRIBUTE, { error: true, selectedFareStages: selectedStagesList });
            redirectTo(res, '/outboundMatching');
            return;
        }

        const formatMatchingFareZones = getFareZones(userFareStages, matchingFareZones);

        const matchedFareZones: MatchingFareZones = {};
        formatMatchingFareZones.forEach(fareStage => {
            matchedFareZones[fareStage.name] = fareStage;
        });

        updateSessionAttribute(req, MATCHING_ATTRIBUTE, { matchedFareZones });

        redirectTo(res, '/selectSalesOfferPackage');
    } catch (error) {
        const message = 'There was a problem generating the matching JSON:';
        redirectToError(res, message, error);
    }
};
