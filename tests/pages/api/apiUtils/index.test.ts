import Cookies from 'cookies';
import {
    getDomain,
    setCookieOnResponseObject,
    getUuidFromCookie,
    redirectOnFareType,
    checkEmailValid,
} from '../../../../src/pages/api/apiUtils';
import * as s3 from '../../../../src/data/s3';
import { getMockRequestAndResponse } from '../../../testData/mockData';

describe('apiUtils', () => {
    const writeHeadMock = jest.fn();

    beforeEach(() => {
        jest.spyOn(s3, 'putStringInS3');

        Cookies.prototype.set = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('checkEmailValid', () => {
        it('returns true if email is valid', () => {
            expect(checkEmailValid('test@email.com')).toBeTruthy();
            expect(checkEmailValid('TEST@EMAIL.COM')).toBeTruthy();
        });

        it('returns false if email is invalid', () => {
            expect(checkEmailValid('@email.com')).toBeFalsy();
            expect(checkEmailValid('test@email')).toBeFalsy();
            expect(checkEmailValid('  test@email.com')).toBeFalsy();
            expect(checkEmailValid('t est@email.com')).toBeFalsy();
            expect(checkEmailValid('test@email.com   ')).toBeFalsy();
            expect(checkEmailValid('test@email .com')).toBeFalsy();
        });
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
            const { req, res } = getMockRequestAndResponse({ fareType: 'single' }, {}, {}, writeHeadMock);
            redirectOnFareType(req, res);
            expect(writeHeadMock).toBeCalledWith(302, {
                Location: '/service',
            });
        });

        it('should return 302 redirect to /service when the return ticket option is selected', () => {
            const { req, res } = getMockRequestAndResponse({ fareType: 'return' }, {}, {}, writeHeadMock);
            redirectOnFareType(req, res);
            expect(writeHeadMock).toBeCalledWith(302, {
                Location: '/service',
            });
        });

        it('should return 302 redirect to /periodType when the period ticket option is selected', () => {
            const { req, res } = getMockRequestAndResponse({ fareType: 'period' }, {}, {}, writeHeadMock);
            redirectOnFareType(req, res);
            expect(writeHeadMock).toBeCalledWith(302, {
                Location: '/periodType',
            });
        });

        it('should return 302 redirect to /serviceList when the flat fare ticket option is selected', () => {
            const { req, res } = getMockRequestAndResponse({ fareType: 'flatFare' }, {}, {}, writeHeadMock);
            redirectOnFareType(req, res);
            expect(writeHeadMock).toBeCalledWith(302, {
                Location: '/serviceList',
            });
        });

        it('should throw error if unexpected fare type is selected', () => {
            const { req, res } = getMockRequestAndResponse({ fareType: 'roundabout' }, null, {}, writeHeadMock);

            expect(() => {
                redirectOnFareType(req, res);
            }).toThrowError(new Error('Fare Type we expect was not received.'));
        });
    });
});
