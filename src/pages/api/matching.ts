import { NextApiResponse } from 'next';
import Cookies from 'cookies';
import { decode } from 'jsonwebtoken';
import { updateSessionAttribute, getSessionAttribute } from '../../utils/sessions';
import { redirectTo, redirectToError, getUuidFromCookie, unescapeAndDecodeCookie, getSelectedStages } from './apiUtils';
import { BasicService, CognitoIdToken, PassengerDetails, NextApiRequestWithSession } from '../../interfaces';
import { Stop } from '../../data/auroradb';
import { putStringInS3, UserFareStages } from '../../data/s3';
import { isCookiesUUIDMatch, isSessionValid } from './service/validator';
import {
    MATCHING_DATA_BUCKET_NAME,
    MATCHING_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
    PASSENGER_TYPE_ATTRIBUTE,
    ID_TOKEN_COOKIE,
} from '../../constants';
import { getFareZones, getMatchingFareZonesFromForm } from './apiUtils/matching';
import { Price } from '../../interfaces/matchingInterface';


interface MatchingBaseData {
    type: string;
    lineName: string;
    nocCode: string;
    operatorShortName: string;
    serviceDescription: string;
    email: string;
    uuid: string;
}

interface MatchingData extends MatchingBaseData {
    fareZones: {
        name: string;
        stops: Stop[];
        prices: {
            price: string;
            fareZones: string[];
        }[];
    }[];
}

interface MatchingReturnData extends MatchingBaseData {
    outboundFareZones: {
        name: string;
        stops: Stop[];
        prices: {
            price: string;
            fareZones: string[];
        }[];
    }[];
    inboundFareZones: [];
}

interface MatchingFareZones {
    [key: string]: {
        name: string;
        stops: Stop[];
        prices: Price[];
    };
}

export const putMatchingDataInS3 = async (data: MatchingData | MatchingReturnData, uuid: string): Promise<void> => {
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
    matchingFareZones: MatchingFareZones,
    fareType: string,
    passengerTypeObject: PassengerDetails,
    email: string,
    uuid: string,
): MatchingData | MatchingReturnData => {
    if (fareType === 'return') {
        return {
            ...service,
            type: 'return',
            outboundFareZones: getFareZones(userFareStages, matchingFareZones),
            inboundFareZones: [],
            ...passengerTypeObject,
            email,
            uuid,
        };
    }

    return {
        ...service,
        type: 'single',
        fareZones: getFareZones(userFareStages, matchingFareZones),
        ...passengerTypeObject,
        email,
        uuid,
    };
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
        const service: BasicService = JSON.parse(req.body.service);
        const userFareStages: UserFareStages = JSON.parse(req.body.userfarestages);
        const matchingFareZones = getMatchingFareZonesFromForm(req);

        // Deleting these keys from the object in order to facilitate looping through the fare stage values in the body
        delete req.body.service;
        delete req.body.userfarestages;

        if (isFareStageUnassigned(userFareStages, matchingFareZones) && matchingFareZones !== {}) {
            const selectedStagesList: {}[] = getSelectedStages(req);

            updateSessionAttribute(req, MATCHING_ATTRIBUTE, {
                body: { error: true, selectedFareStages: selectedStagesList },
            });

            redirectTo(res, '/matching');
            return;
        }

        const uuid = getUuidFromCookie(req, res);

        const cookies = new Cookies(req, res);
        const { fareType } = getSessionAttribute(req, FARE_TYPE_ATTRIBUTE);
        const passengerTypeObject = getSessionAttribute(req, PASSENGER_TYPE_ATTRIBUTE);

        const idToken = unescapeAndDecodeCookie(cookies, ID_TOKEN_COOKIE);
        const decodedIdToken = decode(idToken) as CognitoIdToken;

        const matchingJson = getMatchingJson(
            service,
            userFareStages,
            matchingFareZones,
            fareType,
            passengerTypeObject,
            decodedIdToken.email,
            uuid,
        );

        updateSessionAttribute(req, MATCHING_ATTRIBUTE, { body: { error: false } });
        await putMatchingDataInS3(matchingJson, uuid);

        redirectTo(res, '/thankyou');
    } catch (error) {
        const message = 'There was a problem generating the matching JSON:';
        redirectToError(res, message, error);
    }
};
