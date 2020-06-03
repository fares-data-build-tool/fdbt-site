import Auth from '@aws-amplify/auth';
import login from '../../../src/pages/api/login';
import * as auroradb from '../../../src/data/auroradb';
import { getMockRequestAndResponse } from '../../testData/mockData';
import * as apiUtils from '../../../src/pages/api/apiUtils';
import { OPERATOR_COOKIE } from '../../../src/constants';

jest.mock('../../../src/data/auroradb.ts');

const mockUserCognito = {
    username: 'd3eddd2a-a1c6-4201-82d3-bdab8dcbb586',
    challengeName: 'NEW_PASSWORD_REQUIRED',
    challengeParam: {
        requiredAttributes: [],
    },
};

describe('register', () => {
    const getOperatorNameByNocCodeSpy = jest.spyOn(auroradb, 'getOperatorNameByNocCode');
    const authSignInSpy = jest.spyOn(Auth, 'signIn');
    const setCookieSpy = jest.spyOn(apiUtils, 'setCookieOnResponseObject');

    beforeEach(() => {
        getOperatorNameByNocCodeSpy.mockImplementation(() => Promise.resolve({ operatorPublicName: 'DCCL' }));
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    const writeHeadMock = jest.fn();

    const cases = [
        [
            'empty email',
            { email: '', password: 'abcdefghi' },
            {
                errors: [
                    {
                        id: 'email',
                        errorMessage: 'Enter an email address in the correct format, like name@example.com',
                    },
                ],
            },
        ],
        [
            'password is empty',
            { email: 'test@test.com', password: '' },
            {
                errors: [
                    {
                        id: 'email',
                        errorMessage: 'The email address and/or password are not correct.',
                    },
                ],
            },
        ],
    ];

    test.each(cases)('given %p, sets the correct error cookie', async (_, testData, expectedCookieValue) => {
        const { req, res } = getMockRequestAndResponse({}, testData, {}, writeHeadMock);

        await login(req, res);
        expect(setCookieSpy).toHaveBeenCalledWith(
            'localhost',
            OPERATOR_COOKIE,
            JSON.stringify(expectedCookieValue),
            req,
            res,
        );
    });

    it('should redirect when successfully signed in', async () => {
        authSignInSpy.mockImplementation(() => Promise.resolve(mockUserCognito));

        const { req, res } = getMockRequestAndResponse(
            {},
            {
                email: 'test@test.com',
                password: 'abcdefghi',
            },
            '',
            writeHeadMock,
        );

        await login(req, res);

        expect(authSignInSpy).toHaveBeenCalledWith('test@test.com', 'abcdefg');
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/fareType',
        });
    });

    it('should error when the sign in fails', async () => {
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
            },
            '',
            writeHeadMock,
        );

        await login(req, res);

        expect(setCookieSpy).toHaveBeenCalledWith(
            'localhost',
            OPERATOR_COOKIE,
            JSON.stringify(mockUserCookieValue),
            req,
            res,
        );
    });
});
