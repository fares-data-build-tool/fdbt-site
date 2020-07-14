import passengerType from '../../../src/pages/api/passengerType';
import { getMockRequestAndResponse } from '../../testData/mockData';
import * as utils from '../../../src/pages/api/apiUtils';
import { FARE_TYPE_ATTRIBUTE, PASSENGER_TYPE_ATTRIBUTE } from '../../../src/constants';

describe('passengerType', () => {
    const writeHeadMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should return 302 redirect to /error if faretype cookie is missing', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: { fareType: null },
            body: { passengerType: null },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        passengerType(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/error',
        });
    });

    it('should return 302 redirect to /passengerType when no passenger type is selected', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            session: { [FARE_TYPE_ATTRIBUTE]: { body: 'single' } },
        });
        passengerType(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/passengerType',
        });
    });

    it('should return 302 redirect to /definePassengerType when the user selects Adult', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { passengerType: 'Adult' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            session: {
                [FARE_TYPE_ATTRIBUTE]: { body: 'single' },
                [PASSENGER_TYPE_ATTRIBUTE]: { passengerType: 'Adult' },
            },
        });

        passengerType(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/definePassengerType',
        });
    });

    it('should return 302 redirect to /definePassengerType when the user selects Child', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { passengerType: 'Child' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            session: {
                [FARE_TYPE_ATTRIBUTE]: { body: 'single' },
                [PASSENGER_TYPE_ATTRIBUTE]: { passengerType: 'Child' },
            },
        });

        passengerType(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/definePassengerType',
        });
    });

    it('should return 302 redirect to /definePassengerType when the user selects Infant', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { passengerType: 'Infant' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            session: {
                [FARE_TYPE_ATTRIBUTE]: { body: 'single' },
                [PASSENGER_TYPE_ATTRIBUTE]: { passengerType: 'Infant' },
            },
        });

        passengerType(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/definePassengerType',
        });
    });

    it('should return 302 redirect to /definePassengerType when the user selects Senior', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { passengerType: 'Senior' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            session: {
                [FARE_TYPE_ATTRIBUTE]: { body: 'single' },
                [PASSENGER_TYPE_ATTRIBUTE]: { passengerType: 'Senior' },
            },
        });

        passengerType(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/definePassengerType',
        });
    });

    it('should return 302 redirect to /definePassengerType when the user selects Student', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { passengerType: 'Student' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            session: {
                [FARE_TYPE_ATTRIBUTE]: { body: 'single' },
                [PASSENGER_TYPE_ATTRIBUTE]: { passengerType: 'Student' },
            },
        });

        passengerType(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/definePassengerType',
        });
    });

    it('should return 302 redirect to /definePassengerType when the user selects Young Person', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { passengerType: 'Young Person' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            session: {
                [FARE_TYPE_ATTRIBUTE]: { body: 'single' },
                [PASSENGER_TYPE_ATTRIBUTE]: { passengerType: 'Young Person' },
            },
        });

        passengerType(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/definePassengerType',
        });
    });

    it('should call redirectOnFareType when the user selects Anyone', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { passengerType: 'anyone' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            session: {
                [FARE_TYPE_ATTRIBUTE]: { body: 'single' },
                [PASSENGER_TYPE_ATTRIBUTE]: { passengerType: 'anyone' },
            },
        });
        const redirectOnFareType = jest.spyOn(utils, 'redirectOnFareType');

        passengerType(req, res);

        expect(redirectOnFareType).toHaveBeenCalled();
    });
});
