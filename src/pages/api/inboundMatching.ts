import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import { decode } from 'jsonwebtoken';
import {
    redirectTo,
    redirectToError,
    getUuidFromCookie,
    setCookieOnResponseObject,
    unescapeAndDecodeCookie,
    getSelectedStages,
} from './apiUtils';
import { BasicService, CognitoIdToken, PassengerDetails } from '../../interfaces';
import { Stop } from '../../data/auroradb';
import { getOutboundMatchingFareStages, putStringInS3, UserFareStages } from '../../data/s3';
import { isSessionValid } from './apiUtils/validator';
import { getFareZones, getMatchingFareZonesFromForm } from './apiUtils/matching';
import { MATCHING_DATA_BUCKET_NAME, MATCHING_COOKIE, PASSENGER_TYPE_COOKIE, ID_TOKEN_COOKIE } from '../../constants';
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

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
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

            setCookieOnResponseObject(MATCHING_COOKIE, JSON.stringify({ inbound }), req, res);
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
        const passengerTypeCookie = unescapeAndDecodeCookie(cookies, PASSENGER_TYPE_COOKIE);
        const passengerTypeObject = JSON.parse(passengerTypeCookie);

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

        setCookieOnResponseObject(MATCHING_COOKIE, JSON.stringify({ inbound: { error: false } }), req, res);
        redirectTo(res, '/thankyou');
    } catch (error) {
        const message = 'There was a problem generating the matching JSON.';
        redirectToError(res, message, 'api.inboundMatching', error);
    }
};
