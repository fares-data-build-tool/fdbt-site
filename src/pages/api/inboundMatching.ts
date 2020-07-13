import { NextApiResponse } from 'next';
import Cookies from 'cookies';
import { decode } from 'jsonwebtoken';
import { updateSessionAttribute, getSessionAttribute } from '../../utils/sessions';
import { redirectTo, redirectToError, getUuidFromCookie, unescapeAndDecodeCookie, getSelectedStages } from './apiUtils';
import { BasicService, CognitoIdToken, PassengerDetails, NextApiRequestWithSession } from '../../interfaces';
import { Stop } from '../../data/auroradb';
import { getOutboundMatchingFareStages, putStringInS3, UserFareStages } from '../../data/s3';
import { isCookiesUUIDMatch, isSessionValid } from './service/validator';
import { getFareZones, getMatchingFareZonesFromForm } from './apiUtils/matching';
import {
    MATCHING_DATA_BUCKET_NAME,
    MATCHING_ATTRIBUTE,
    PASSENGER_TYPE_ATTRIBUTE,
    ID_TOKEN_COOKIE,
} from '../../constants';
import { Price } from '../../interfaces/matchingInterface';

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
    email: string;
    operatorShortName: string;
    inboundFareZones: FareZones[];
    outboundFareZones: FareZones[];
    uuid: string;
}

interface MatchingFareZones {
    [key: string]: {
        name: string;
        stops: Stop[];
        prices: Price[];
    };
}

export const putMatchingDataInS3 = async (data: MatchingData, uuid: string): Promise<void> => {
    await putStringInS3(
        MATCHING_DATA_BUCKET_NAME,
        `${data.nocCode}/${data.type}/${uuid}_${Date.now()}.json`,
        JSON.stringify(data),
        'application/json; charset=utf-8',
    );
};

const getMatchingJson = (
    service: BasicService,
    userFareStages: UserFareStages,
    inboundFareZones: MatchingFareZones,
    outboundFareZones: MatchingFareZones,
    passengerTypeObject: PassengerDetails,
    email: string,
    uuid: string,
): MatchingData => ({
    ...service,
    type: 'return',
    inboundFareZones: getFareZones(userFareStages, inboundFareZones),
    outboundFareZones: getFareZones(userFareStages, outboundFareZones),
    ...passengerTypeObject,
    email,
    uuid,
});

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

        const service: BasicService = JSON.parse(req.body.service);
        const userFareStages: UserFareStages = JSON.parse(req.body.userfarestages);

        const inboundFareZones = getMatchingFareZonesFromForm(req);

        // Deleting these keys from the object in order to faciliate looping through the fare stage values in the body
        delete req.body.service;
        delete req.body.userfarestages;

        if (isFareStageUnassigned(userFareStages, inboundFareZones) && inboundFareZones !== {}) {
            const selectedStagesList: {}[] = getSelectedStages(req);

            const inbound = { error: true, selectedFareStages: selectedStagesList };

            updateSessionAttribute(req, MATCHING_ATTRIBUTE, { body: { inbound } });
            redirectTo(res, '/inboundMatching');
            return;
        }

        const uuid = getUuidFromCookie(req, res);

        // get the outbound matching fare zones for outbound
        const outboundFareZones = await getOutboundMatchingFareStages(uuid);

        if (!outboundFareZones) {
            throw new Error('no outbound fare stages retrieved');
        }

        const cookies = new Cookies(req, res);
        const passengerTypeObject = getSessionAttribute(req, PASSENGER_TYPE_ATTRIBUTE);

        const idToken = unescapeAndDecodeCookie(cookies, ID_TOKEN_COOKIE);
        const decodedIdToken = decode(idToken) as CognitoIdToken;

        const matchingJson = getMatchingJson(
            service,
            userFareStages,
            inboundFareZones,
            outboundFareZones,
            passengerTypeObject,
            decodedIdToken.email,
            uuid,
        );

        await putMatchingDataInS3(matchingJson, uuid);

        // maybe can delete this.
        updateSessionAttribute(req, MATCHING_ATTRIBUTE, { body: { inbound: { error: false } } });
        redirectTo(res, '/thankyou');
    } catch (error) {
        const message = 'There was a problem generating the matching JSON.';
        redirectToError(res, message, error);
    }
};
