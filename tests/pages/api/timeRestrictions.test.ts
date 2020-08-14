import { timeRestrictionsErrorId } from '../../../src/pages/timeRestrictions';
import * as utils from '../../../src/pages/api/apiUtils/index';
import timeRestrictions from '../../../src/pages/api/timeRestrictions';
import { getMockRequestAndResponse } from '../../testData/mockData';
import { isSessionValid } from '../../../src/pages/api/apiUtils/validator';
import * as sessionUtils from '../../../src/utils/sessions';
import { TIME_RESTRICTIONS_ATTRIBUTE } from '../../../src/constants';

beforeEach(() => {
    (isSessionValid as {}) = jest.fn().mockReturnValue(true);
});

afterEach(() => {
    jest.resetAllMocks();
});

describe('timeRestrictions', () => {
    it('should throw an error and redirect to the error page when the FARE_TYPE_COOKIE is missing', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: { fareType: null },
            body: {},
            uuid: {},
        });
        timeRestrictions(req, res);
        expect(res.writeHead).toBeCalledWith(302, {
            Location: '/error',
        });
    });

    it('should 302 redirect to /timeRestrictions and add errors to cookie, when there is no body in the request', () => {
        const updateSessionAttributeSpy = jest.spyOn(sessionUtils, 'updateSessionAttribute');
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {},
            uuid: {},
        });
        timeRestrictions(req, res);
        expect(res.writeHead).toBeCalledWith(302, {
            Location: '/timeRestrictions',
        });
        console.log(updateSessionAttributeSpy.mock.calls[0][2]);
        expect(updateSessionAttributeSpy).toBeCalledWith(req, TIME_RESTRICTIONS_ATTRIBUTE, {
            timeRestrictions: false,
            errors: [{ errorMessage: 'Choose either yes or no', id: timeRestrictionsErrorId }],
        });
    });

    it('should 302 redirect to /error when session is not valid', () => {
        (isSessionValid as {}) = jest.fn().mockReturnValue(false);
        const { req, res } = getMockRequestAndResponse({
            cookieValues: { operator: null },
            body: null,
            uuid: {},
        });
        timeRestrictions(req, res);
        expect(res.writeHead).toBeCalledWith(302, {
            Location: '/error',
        });
    });

    it('should redirect on fare type when no is selected for time restrictions', () => {
        const redirectOnFareType = jest.spyOn(utils, 'redirectOnFareType');
        const { req, res } = getMockRequestAndResponse({
            cookieValues: { operator: null },
            body: {
                timeRestrictions: 'no',
            },
            uuid: {},
        });
        timeRestrictions(req, res);
        expect(redirectOnFareType).toBeCalled();
    });

    it('should 302 redirect to /defineTimeRestrictions when yes is selected for time restrictions', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                timeRestrictions: 'yes',
            },
            uuid: {},
        });
        timeRestrictions(req, res);
        expect(res.writeHead).toBeCalledWith(302, {
            Location: '/defineTimeRestrictions',
        });
    });
});
