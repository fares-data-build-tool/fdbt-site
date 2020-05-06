/* eslint-disable @typescript-eslint/no-explicit-any */
import inboundMatching from '../../../src/pages/api/inboundMatching';
import {
    getMockRequestAndResponse,
    service,
    mockMatchingUserFareStagesWithUnassignedStages,
    mockMatchingUserFareStagesWithAllStagesAssigned,
    expectedInboundOutboundMatchingJson,
} from '../../testData/mockData';
import * as s3 from '../../../src/data/s3';
import { MatchingFareZones } from '../../../src/interfaces/matchingInterface';

jest.mock('../../../src/data/s3.ts');

const selectedOptions = {
    option0:
        '{"stop":{"stopName":"Yoden Way - Chapel Hill Road","naptanCode":"duratdmj","atcoCode":"13003521G","localityCode":"E0045956","localityName":"Peterlee","indicator":"W-bound","street":"Yodan Way"},"stage":"Acomb Green Lane"}',
    option1:
        '{"stop":{"stopName":"Yoden Way","naptanCode":"duratdmt","atcoCode":"13003522F","localityCode":"E0010183","localityName":"Horden","indicator":"SW-bound","street":"Yoden Way"},"stage":"Mattison Way"}',
    option2:
        '{"stop":{"stopName":"Surtees Rd-Edenhill Rd","naptanCode":"durapgdw","atcoCode":"13003219H","localityCode":"E0045956","localityName":"Peterlee","indicator":"NW-bound","street":"Surtees Road"},"stage":"Holl Bank/Beech Ave"}',
    option3:
        '{"stop":{"stopName":"Bus Station","naptanCode":"duratdma","atcoCode":"13003519H","localityCode":"E0045956","localityName":"Peterlee","indicator":"H","street":"Bede Way"},"stage":"Blossom Street"}',
    option4:
        '{"stop":{"stopName":"Kell Road","naptanCode":"duraptwp","atcoCode":"13003345D","localityCode":"E0010183","localityName":"Horden","indicator":"SE-bound","street":"Kell Road"},"stage":"Piccadilly (York)"}',
};

const matchingOutBound: MatchingFareZones = {
    'Acomb Green Lane': {
        name: 'Acomb Green Lane',
        stops: [
            {
                stopName: 'Yoden Way - Chapel Hill Road',
                atcoCode: '13003521G',
                localityCode: 'E0045956',
                naptanCode: 'duratdmj',
                localityName: 'Peterlee',
                indicator: 'W-bound',
                street: 'Yodan Way',
                qualifierName: '',
                parentLocalityName: 'IW Test',
            },
        ],
        prices: [
            {
                price: '1.10',
                fareZones: ['Mattison Way', 'Nursery Drive', 'Holl Bank/Beech Ave'],
            },
            {
                price: '1.70',
                fareZones: ['Cambridge Street (York)', 'Blossom Street', 'Rail Station (York)', 'Piccadilly (York)'],
            },
        ],
    },
};

describe('Inbound Matching API', () => {
    const putStringInS3Spy = jest.spyOn(s3, 'putStringInS3');
    putStringInS3Spy.mockImplementation(() => Promise.resolve());

    const matchingFareZones = jest.spyOn(s3, 'getOutboundMatchingFareStages');
    matchingFareZones.mockImplementation(() => Promise.resolve(matchingOutBound));
    const writeHeadMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('correctly generates matching JSON and uploads to S3', async () => {
        const { req, res } = getMockRequestAndResponse(
            {},
            {
                ...selectedOptions,
                service: JSON.stringify(service),
                userfarestages: JSON.stringify(mockMatchingUserFareStagesWithAllStagesAssigned),
            },
            {},
            writeHeadMock,
        );

        await inboundMatching(req, res);

        const actualMatchingData = JSON.parse((putStringInS3Spy as jest.Mock).mock.calls[0][2]);
        expect(putStringInS3Spy).toBeCalledWith(
            'fdbt-matching-data-dev',
            '1e0459b3-082e-4e70-89db-96e8ae173e10.json',
            expect.any(String),
            'application/json; charset=utf-8',
        );
        expect(expectedInboundOutboundMatchingJson).toEqual(actualMatchingData);
    });

    it('correctly redirects to inboundMatching page when there are fare stages that have not been assigned to stops', async () => {
        const { req, res } = getMockRequestAndResponse(
            {},
            {
                ...selectedOptions,
                service: JSON.stringify(service),
                userfarestages: JSON.stringify(mockMatchingUserFareStagesWithUnassignedStages),
            },
            {},
            writeHeadMock,
        );
        await inboundMatching(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/inboundMatching',
        });
    });

    it('redirects to inboundMatching page if no stops are allocated to fare stages', async () => {
        const { req, res } = getMockRequestAndResponse(
            {},
            {
                option0: '',
                option1: '',
                service: JSON.stringify(service),
                userfarestages: JSON.stringify(mockMatchingUserFareStagesWithAllStagesAssigned),
            },
            {},
            writeHeadMock,
        );

        await inboundMatching(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/inboundMatching',
        });
    });

    it('redirects to thankyou page if all valid', async () => {
        const { req, res } = getMockRequestAndResponse(
            {},
            {
                ...selectedOptions,
                service: JSON.stringify(service),
                userfarestages: JSON.stringify(mockMatchingUserFareStagesWithAllStagesAssigned),
            },
            {},
            writeHeadMock,
        );

        await inboundMatching(req, res);
        expect(writeHeadMock).toBeCalled();
    });

    it('redirects back to inbound matching page if no user data in body', async () => {
        const { req, res } = getMockRequestAndResponse(
            {},
            { ...selectedOptions, service: JSON.stringify(service), userfarestages: '' },
            {},
            writeHeadMock,
        );

        await inboundMatching(req, res);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/error',
        });
    });

    it('redirects back to inbound matching page if no service info in body', async () => {
        const { req, res } = getMockRequestAndResponse(
            {},
            {
                ...selectedOptions,
                service: '',
                userfarestages: JSON.stringify(mockMatchingUserFareStagesWithAllStagesAssigned),
            },
            {},
            writeHeadMock,
        );

        await inboundMatching(req, res);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/error',
        });
    });

    it('should redirect to the error page if the cookie UUIDs to do not match', async () => {
        const { req, res } = getMockRequestAndResponse({}, null, { journeyUuid: 'someUuid' }, writeHeadMock);

        await inboundMatching(req, res);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/error',
        });
    });
});