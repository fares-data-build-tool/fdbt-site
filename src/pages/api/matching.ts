import { NextApiResponse } from 'next';
import { updateSessionAttribute } from '../../utils/sessions';
import { redirectTo, redirectToError, getSelectedStages } from './apiUtils';
import { BasicService, NextApiRequestWithSession } from '../../interfaces';
import { UserFareStages } from '../../data/s3';
import { isSessionValid } from './apiUtils/validator';
import { MATCHING_ATTRIBUTE } from '../../constants';
import { getMatchingFareZonesFromForm, isFareStageUnassigned } from './apiUtils/matching';
import { MatchingWithErrors, MatchingInfo } from '../../interfaces/matchingInterface';

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
        }

        if (!req.body.service || !req.body.userfarestages) {
            throw new Error('No service or userfarestages info found');
        }

        if (req.body.interpolate === 'yes') {
            delete req.body.service;
            delete req.body.userfarestages;
            delete req.body.interpolate;
            const keys = Object.keys(req.body);
            const data = req.body;
            let currentFareStage = '';
            keys.forEach((key, index) => {
                if (index === 0) {
                    currentFareStage = data[key];
                }

                if (data[key] === '') {
                    data[key] = currentFareStage;
                } else {
                    currentFareStage = data[key];
                }
            });
            const interpolatedStages: string[] = [];

            Object.keys(data).map(e => {
                if (data[e] !== '') {
                    interpolatedStages.push(data[e]);
                }
                return null;
            });

            const matchingAttributeError: MatchingWithErrors = { error: false, selectedFareStages: interpolatedStages };
            updateSessionAttribute(req, MATCHING_ATTRIBUTE, matchingAttributeError);
            redirectTo(res, '/matching');
            return;
        }
        const service: BasicService = JSON.parse(req.body.service);
        const userFareStages: UserFareStages = JSON.parse(req.body.userfarestages);
        const matchingFareZones = getMatchingFareZonesFromForm(req);

        // Deleting these keys from the object in order to facilitate looping through the fare stage values in the body
        delete req.body.service;
        delete req.body.userfarestages;

        if (isFareStageUnassigned(userFareStages, matchingFareZones) && matchingFareZones !== {}) {
            const selectedStagesList: string[] = getSelectedStages(req);
            const matchingAttributeError: MatchingWithErrors = { error: true, selectedFareStages: selectedStagesList };
            updateSessionAttribute(req, MATCHING_ATTRIBUTE, matchingAttributeError);

            redirectTo(res, '/matching');

            return;
        }
        const matchingAttributeValue: MatchingInfo = { service, userFareStages, matchingFareZones };
        updateSessionAttribute(req, MATCHING_ATTRIBUTE, matchingAttributeValue);

        redirectTo(res, '/selectSalesOfferPackage');
    } catch (error) {
        const message = 'There was a problem generating the matching JSON:';
        redirectToError(res, message, 'api.matching', error);
    }
};
