import Auth from '@aws-amplify/auth';
import register from '../../../src/pages/api/register';
import * as auroradb from '../../../src/data/auroradb';
import { getMockRequestAndResponse } from '../../testData/mockData';
import * as apiUtils from '../../../src/pages/api/apiUtils';
import { USER_COOKIE } from '../../../src/constants';

jest.mock('../../../src/data/auroradb.ts');

const mockUserCognito = {
    username: 'd3eddd2a-a1c6-4201-82d3-bdab8dcbb586',
    challengeName: 'NEW_PASSWORD_REQUIRED',
    challengeParam: {
        requiredAttributes: [],
    },
};

describe('register', () => {
    const getServicesByNocCodeSpy = jest.spyOn(auroradb, 'getServicesByNocCode');
    const authSignInSpy = jest.spyOn(Auth, 'signIn');
    const authCompletePasswordSpy = jest.spyOn(Auth, 'completeNewPassword');
    const authSignOutSpy = jest.spyOn(Auth, 'signOut');

    beforeEach(() => {
        getServicesByNocCodeSpy.mockImplementation(() =>
            Promise.resolve([{ lineName: '2AC', startDate: '01012020', description: 'linename for service ' }]),
        );
    });

    const writeHeadMock = jest.fn();

    it('should error if the email is not correct or empty', async () => {
        const setCookieSpy = jest.spyOn(apiUtils, 'setCookieOnResponseObject');

        const { req, res } = getMockRequestAndResponse(
            {},
            { email: '', password: 'abcdefghi', confirmPassword: 'abcdefghi', nocCode: 'DCCL', regKey: 'abcdefg' },
            '',
            writeHeadMock,
        );

        const mockUserCookieValue = {
            inputChecks: [
                {
                    inputValue: '',
                    id: 'email',
                    error: 'Enter an email address in the correct format, like name@example.com',
                },
                { inputValue: '', id: 'password', error: '' },
                { inputValue: 'DCCL', id: 'nocCode', error: '' },
            ],
        };

        await register(req, res);
        expect(setCookieSpy).toHaveBeenCalledWith(
            'localhost',
            USER_COOKIE,
            JSON.stringify(mockUserCookieValue),
            req,
            res,
        );
    });

    it('should error if the password is less than 8 characters', async () => {
        const setCookieSpy = jest.spyOn(apiUtils, 'setCookieOnResponseObject');

        const { req, res } = getMockRequestAndResponse(
            {},
            {
                email: 'test@test.com',
                password: 'abchi',
                confirmPassword: 'abcdefghi',
                nocCode: 'DCCL',
                regKey: 'abcdefg',
            },
            '',
            writeHeadMock,
        );

        const mockUserCookieValue = {
            inputChecks: [
                {
                    inputValue: 'test@test.com',
                    id: 'email',
                    error: '',
                },
                { inputValue: '', id: 'password', error: 'Password cannot be empty or less than 8 characters' },
                { inputValue: 'DCCL', id: 'nocCode', error: '' },
            ],
        };

        await register(req, res);

        expect(setCookieSpy).toHaveBeenCalledWith(
            'localhost',
            USER_COOKIE,
            JSON.stringify(mockUserCookieValue),
            req,
            res,
        );
    });

    it('should error if the password is empty', async () => {
        const setCookieSpy = jest.spyOn(apiUtils, 'setCookieOnResponseObject');

        const { req, res } = getMockRequestAndResponse(
            {},
            { email: 'test@test.com', password: '', confirmPassword: 'abcdefghi', nocCode: 'DCCL', regKey: 'abcdefg' },
            '',
            writeHeadMock,
        );

        const mockUserCookieValue = {
            inputChecks: [
                {
                    inputValue: 'test@test.com',
                    id: 'email',
                    error: '',
                },
                { inputValue: '', id: 'password', error: 'Password cannot be empty or less than 8 characters' },
                { inputValue: 'DCCL', id: 'nocCode', error: '' },
            ],
        };

        await register(req, res);
        expect(setCookieSpy).toHaveBeenCalledWith(
            'localhost',
            USER_COOKIE,
            JSON.stringify(mockUserCookieValue),
            req,
            res,
        );
    });

    it('should error if the password fields do not match', async () => {
        const setCookieSpy = jest.spyOn(apiUtils, 'setCookieOnResponseObject');

        const { req, res } = getMockRequestAndResponse(
            {},
            {
                email: 'test@test.com',
                password: 'abcdefghidddd',
                confirmPassword: 'abcdefghi',
                nocCode: 'DCCL',
                regKey: 'abcdefg',
            },
            '',
            writeHeadMock,
        );

        const mockUserCookieValue = {
            inputChecks: [
                {
                    inputValue: 'test@test.com',
                    id: 'email',
                    error: '',
                },
                { inputValue: '', id: 'password', error: 'Passwords do not match' },
                { inputValue: 'DCCL', id: 'nocCode', error: '' },
            ],
        };

        await register(req, res);
        expect(setCookieSpy).toHaveBeenCalledWith(
            'localhost',
            USER_COOKIE,
            JSON.stringify(mockUserCookieValue),
            req,
            res,
        );
    });

    it('should error if the Noc code fields are empty', async () => {
        const setCookieSpy = jest.spyOn(apiUtils, 'setCookieOnResponseObject');

        const { req, res } = getMockRequestAndResponse(
            {},
            {
                email: 'test@test.com',
                password: 'abcdefghidddd',
                confirmPassword: 'abcdefghidddd',
                nocCode: '',
                regKey: 'abcdefg',
            },
            '',
            writeHeadMock,
        );

        const mockUserCookieValue = {
            inputChecks: [
                {
                    inputValue: 'test@test.com',
                    id: 'email',
                    error: '',
                },
                { inputValue: '', id: 'password', error: '' },
                { inputValue: '', id: 'nocCode', error: 'NOC cannot be empty' },
            ],
        };

        await register(req, res);
        expect(setCookieSpy).toHaveBeenCalledWith(
            'localhost',
            USER_COOKIE,
            JSON.stringify(mockUserCookieValue),
            req,
            res,
        );
    });

    it('should error when the service noc code is invalid', async () => {
        const setCookieSpy = jest.spyOn(apiUtils, 'setCookieOnResponseObject');
        getServicesByNocCodeSpy.mockImplementation(() => Promise.resolve([]));

        const { req, res } = getMockRequestAndResponse(
            {},
            {
                email: 'test@test.com',
                password: 'abcdefghi',
                confirmPassword: 'abcdefghi',
                nocCode: 'abcd',
                regKey: 'abcdefg',
            },
            '',
            writeHeadMock,
        );

        const mockUserCookieValue = {
            inputChecks: [
                {
                    inputValue: 'test@test.com',
                    id: 'email',
                    error: '',
                },
                { inputValue: '', id: 'password', error: '' },
                { inputValue: 'abcd', id: 'nocCode', error: '' },
                {
                    inputValue: '',
                    id: 'email',
                    error: 'There was a problem logging you in',
                },
            ],
        };

        await register(req, res);

        expect(setCookieSpy).toHaveBeenCalledWith(
            'localhost',
            USER_COOKIE,
            JSON.stringify(mockUserCookieValue),
            req,
            res,
        );
    });

    it('should redirect when successfully signed in', async () => {
        authSignInSpy.mockImplementation(() => Promise.resolve(mockUserCognito));
        authCompletePasswordSpy.mockImplementation(() => Promise.resolve(mockUserCognito));
        authSignOutSpy.mockImplementation(() => Promise.resolve());

        const { req, res } = getMockRequestAndResponse(
            {},
            {
                email: 'test@test.com',
                password: 'abcdefghi',
                confirmPassword: 'abcdefghi',
                nocCode: 'DCCL',
                regKey: 'abcdefg',
            },
            '',
            writeHeadMock,
        );

        await register(req, res);

        expect(authSignInSpy).toHaveBeenCalledWith('test@test.com', 'abcdefg');
        expect(authCompletePasswordSpy).toHaveBeenCalledWith(mockUserCognito, 'abcdefghi', { 'custom:noc': 'DCCL' });
        expect(authSignOutSpy).toHaveBeenCalled();
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/confirmRegistration',
        });
    });

    it('should error when the sign in fails', async () => {
        const setCookieSpy = jest.spyOn(apiUtils, 'setCookieOnResponseObject');

        authSignInSpy.mockImplementation(() => Promise.resolve());

        const mockUserCookieValue = {
            inputChecks: [
                {
                    inputValue: 'test@test.com',
                    id: 'email',
                    error: '',
                },
                { inputValue: '', id: 'password', error: '' },
                { inputValue: 'DCCL', id: 'nocCode', error: '' },
                {
                    inputValue: '',
                    id: 'email',
                    error: 'There was a problem creating your account',
                },
            ],
        };

        const { req, res } = getMockRequestAndResponse(
            {},
            {
                email: 'test@test.com',
                password: 'abcdefghi',
                confirmPassword: 'abcdefghi',
                nocCode: 'DCCL',
                regKey: 'abcdefg',
            },
            '',
            writeHeadMock,
        );

        await register(req, res);

        expect(setCookieSpy).toHaveBeenCalledWith(
            'localhost',
            USER_COOKIE,
            JSON.stringify(mockUserCookieValue),
            req,
            res,
        );
    });
});
