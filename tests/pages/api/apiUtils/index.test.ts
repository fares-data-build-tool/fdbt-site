import Cookies from 'cookies';
import {
    getDomain,
    setCookieOnResponseObject,
    getUuidFromCookie,
    redirectOnFareType,
} from '../../../../src/pages/api/apiUtils';
import * as s3 from '../../../../src/data/s3';
import { getMockRequestAndResponse } from '../../../testData/mockData';

describe('apiUtils', () => {
    beforeEach(() => {
        jest.spyOn(s3, 'putStringInS3');

        Cookies.prototype.set = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('getDomain', () => {
        it('should return the domain without a port number', () => {
            const expected = 'localhost';
            const { req } = getMockRequestAndResponse();
            const result = getDomain(req);
            expect(result).toEqual(expected);
        });
    });

    describe('setCookieOnResponseObject', () => {
        it('to call set cookie library', () => {
            const domain = 'localhost';
            const cookieName = 'test';
            const cookieValue = 'cookieValue';
            const { req, res } = getMockRequestAndResponse();
            setCookieOnResponseObject(domain, cookieName, cookieValue, req, res);
            expect(Cookies.prototype.set).toBeCalledWith(cookieName, cookieValue, {
                domain,
                path: '/',
                maxAge: 1000 * (3600 * 24),
                sameSite: 'strict',
            });
        });
    });

    describe('getUuidFromCookie', () => {
        it('should get the uuid from the cookie', () => {
            const { req, res } = getMockRequestAndResponse({}, null, {
                operatorUuid: '780e3459-6305-4ae5-9082-b925b92cb46c',
            });
            const result = getUuidFromCookie(req, res);
            expect(result).toBe('780e3459-6305-4ae5-9082-b925b92cb46c');
        });
    });

    describe('redirectOnFareType', () => {
        it('should return 302 redirect to /service when the single ticket option is selected', () => {
            const writeHeadMock = jest.fn();
            const { req, res } = getMockRequestAndResponse({ fareType: 'single' }, {}, {}, writeHeadMock);
            redirectOnFareType(req, res);
            expect(writeHeadMock).toBeCalledWith(302, {
                Location: '/service',
            });
        });

        it('should return 302 redirect to /service when the return ticket option is selected', () => {
            const writeHeadMock = jest.fn();
            const { req, res } = getMockRequestAndResponse({ fareType: 'return' }, {}, {}, writeHeadMock);
            redirectOnFareType(req, res);
            expect(writeHeadMock).toBeCalledWith(302, {
                Location: '/service',
            });
        });

        it('should return 302 redirect to /periodType when the period ticket option is selected', () => {
            const writeHeadMock = jest.fn();
            const { req, res } = getMockRequestAndResponse({ fareType: 'period' }, {}, {}, writeHeadMock);
            redirectOnFareType(req, res);
            expect(writeHeadMock).toBeCalledWith(302, {
                Location: '/periodType',
            });
        });

        it('should return 302 redirect to /serviceList when the flat fare ticket option is selected', () => {
            const writeHeadMock = jest.fn();
            const { req, res } = getMockRequestAndResponse({ fareType: 'flatFare' }, {}, {}, writeHeadMock);
            redirectOnFareType(req, res);
            expect(writeHeadMock).toBeCalledWith(302, {
                Location: '/serviceList',
            });
        });
    });
});
