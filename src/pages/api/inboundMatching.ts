import { NextApiRequest, NextApiResponse } from 'next';
import { redirectTo, redirectToError, getUuidFromCookie, setCookieOnResponseObject, getDomain } from './apiUtils';
import { BasicService } from '../matching';
import { Stop } from '../../data/auroradb';
import { getMatchingFareStages, putStringInS3, UserFareStages } from '../../data/s3';
import { isCookiesUUIDMatch, isSessionValid } from './service/validator';
import { MATCHING_DATA_BUCKET_NAME, MATCHING_COOKIE } from '../../constants';

interface FareZones {
    name: string;
    stops: Stop[];
    prices: {
        price: string;
        fareZones: string[];
    }[];
}

interface MatchingData {
    type: string;
    lineName: string;
    nocCode: string;
    operatorShortName: string;
    inboundFareZones: FareZones[];
    outboundFareZones: FareZones[];
}

interface MatchingFareZones {
    [key: string]: {
        name: string;
        stops: Stop[];
    };
}

export const putMatchingDataInS3 = async (data: MatchingData, uuid: string): Promise<void> => {
    await putStringInS3(
        MATCHING_DATA_BUCKET_NAME,
        `return-single/matching/${uuid}.json`,
        JSON.stringify(data),
        'application/json; charset=utf-8',
    );
};

const getMatchingFareZonesFromForm = (req: NextApiRequest): MatchingFareZones => {
    const matchingFareZones: MatchingFareZones = {};
    const bodyValues: string[] = Object.values(req.body);

    bodyValues.forEach((zoneString: string) => {
        if (zoneString && typeof zoneString === 'string') {
            const zone = JSON.parse(zoneString);

            if (matchingFareZones[zone.stage]) {
                matchingFareZones[zone.stage].stops.push(zone.stop);
            } else {
                matchingFareZones[zone.stage] = {
                    name: zone.stage,
                    stops: [zone.stop],
                };
            }
        }
    });

    if (Object.keys(matchingFareZones).length === 0) {
        throw new Error('No Stops allocated to fare stages');
    }

    return matchingFareZones;
};

const getMatchingJson = (
    service: BasicService,
    userFareStages: UserFareStages,
    inboundMatchingFareZones: MatchingFareZones,
    outboundMatchingFareZones: MatchingFareZones,
): MatchingData => ({
    ...service,
    type: 'ReturnSingle',
    inboundFareZones: userFareStages.fareStages
        .filter(userStage => inboundMatchingFareZones[userStage.stageName])
        .map(userStage => {
            const matchedZone = inboundMatchingFareZones[userStage.stageName];

            return {
                name: userStage.stageName,
                stops: matchedZone.stops.map((stop: Stop) => ({
                    ...stop,
                    qualifierName: '',
                })),
                prices: userStage.prices,
            };
        }),
    outboundFareZones: userFareStages.fareStages
        .filter(userStage => outboundMatchingFareZones[userStage.stageName])
        .map(userStage => {
            const matchedZone = outboundMatchingFareZones[userStage.stageName];

            return {
                name: userStage.stageName,
                stops: matchedZone.stops.map((stop: Stop) => ({
                    ...stop,
                    qualifierName: '',
                })),
                prices: userStage.prices,
            };
        }),
});

const isFareStageUnassigned = (userFareStages: UserFareStages, matchingFareZones: MatchingFareZones): boolean =>
    userFareStages.fareStages.some(stage => !matchingFareZones[stage.stageName]);

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
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

        const service: BasicService = JSON.parse(req.body.service);
        const userFareStages: UserFareStages = JSON.parse(req.body.userfarestages);

        const inboundMatchingFareZones = getMatchingFareZonesFromForm(req);

        if (isFareStageUnassigned(userFareStages, inboundMatchingFareZones) && inboundMatchingFareZones !== {}) {
            const error = { error: true };
            setCookieOnResponseObject(getDomain(req), MATCHING_COOKIE, JSON.stringify({ error }), req, res);
            redirectTo(res, '/inboundMatching');
            return;
        }

        // Deleting these keys from the object in order to faciliate looping through the fare stage values in the body
        delete req.body.service;
        delete req.body.userfarestages;

        const uuid = getUuidFromCookie(req, res);

        // get the outbound matching fare zones for outbound
        const outboundMatchingFareZones = await getMatchingFareStages(uuid);

        if (!outboundMatchingFareZones) {
            throw new Error('no outbound fare stages retrieved');
        }

        const matchingJson = getMatchingJson(
            service,
            userFareStages,
            inboundMatchingFareZones,
            outboundMatchingFareZones,
        );

        await putMatchingDataInS3(matchingJson, uuid);

        redirectTo(res, '/thankyou');
    } catch (error) {
        const message = 'There was a problem generating the matching JSON:';
        redirectToError(res, message, error);
    }
};
