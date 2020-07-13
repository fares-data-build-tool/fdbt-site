import { NextApiResponse } from 'next';
import { NextApiRequestWithSession } from '../../interfaces/index';
import { updateSessionAttribute } from '../../utils/sessions';
import { redirectTo, redirectToError, getUuidFromCookie, getSelectedStages } from './apiUtils';
import { putStringInS3, UserFareStages } from '../../data/s3';
import { isCookiesUUIDMatch, isSessionValid } from './service/validator';
import { MATCHING_ATTRIBUTE, USER_DATA_BUCKET_NAME } from '../../constants';
import { MatchingFareZones } from '../../interfaces/matchingInterface';
import { getFareZones, getMatchingFareZonesFromForm } from './apiUtils/matching';

export const putOutboundMatchingDataInS3 = async (data: MatchingFareZones, uuid: string): Promise<void> => {
    await putStringInS3(
        USER_DATA_BUCKET_NAME,
        `return/outbound/${uuid}.json`,
        JSON.stringify(data),
        'application/json; charset=utf-8',
    );
};

const isFareStageUnassigned = (userFareStages: UserFareStages, matchingFareZones: MatchingFareZones): boolean =>
    userFareStages.fareStages.some(stage => !matchingFareZones[stage.stageName]);

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
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

            const outbound = { error: true, selectedFareStages: selectedStagesList };

            updateSessionAttribute(req, MATCHING_ATTRIBUTE, { body: { outbound } });
            redirectTo(res, '/outboundMatching');
            return;
        }

        const uuid = getUuidFromCookie(req, res);

        const formatMatchingFareZones = getFareZones(userFareStages, matchingFareZones);

        const matchedFareZones: MatchingFareZones = {};
        formatMatchingFareZones.forEach(fareStage => {
            matchedFareZones[fareStage.name] = fareStage;
        });

        await putOutboundMatchingDataInS3(matchedFareZones, uuid);

        updateSessionAttribute(req, MATCHING_ATTRIBUTE, { body: { outbound: { error: false } } });

        redirectTo(res, '/inboundMatching');
    } catch (error) {
        const message = 'There was a problem generating the matching JSON:';
        redirectToError(res, message, error);
    }
};
