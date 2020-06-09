import Auth from '@aws-amplify/auth';
import resetPassword from '../../../src/pages/api/resetPassword';
import { getMockRequestAndResponse } from '../../testData/mockData';
import * as apiUtils from '../../../src/pages/api/apiUtils';
import { USER_COOKIE } from '../../../src/constants';

describe('register', () => {
    const forgotPasswordSubmitSpy = jest.spyOn(Auth, 'forgotPasswordSubmit');
    const setCookieSpy = jest.spyOn(apiUtils, 'setCookieOnResponseObject');

    beforeEach(() => {
        forgotPasswordSubmitSpy.mockImplementation(() => Promise.resolve());
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    const writeHeadMock = jest.fn();
    const expiryDate = Math.abs(new Date(2020, 5, 30).getTime() / 1000);

    const cases = [
        [
            'password less than 8 characters',
            {
                username: 'test@test.com',
                password: 'abbb',
                confirmPassword: 'abcdefghi',
                regKey: 'abcdefg',
                expiry: expiryDate,
            },
            {
                inputChecks: [
                    { inputValue: '', id: 'password', error: 'Password cannot be empty or less than 8 characters' },
                ],
            },
        ],
        [
            'password is empty',
            {
                username: 'test@test.com',
                password: '',
                confirmPassword: 'abcdefghi',
                regKey: 'abcdefg',
                expiry: expiryDate,
            },
            {
                inputChecks: [
                    { inputValue: '', id: 'password', error: 'Password cannot be empty or less than 8 characters' },
                ],
            },
        ],
        [
            'passwords fields do not match',
            {
                username: 'test@test.com',
                password: 'abbadjhfddddd',
                confirmPassword: 'abcdefghi',
                regKey: 'abcdefg',
                expiry: expiryDate,
            },
            {
                inputChecks: [{ inputValue: '', id: 'password', error: 'Passwords do not match' }],
            },
        ],
    ];

    test.each(cases)('given %p, sets the correct error cookie', async (_, testData, expectedCookieValue) => {
        const { req, res } = getMockRequestAndResponse({}, testData, {}, writeHeadMock);

        await resetPassword(req, res);
        expect(setCookieSpy).toHaveBeenCalledWith(
            'localhost',
            USER_COOKIE,
            JSON.stringify(expectedCookieValue),
            req,
            res,
        );
    });

    it('should redirect when successfully resetting password', async () => {
        forgotPasswordSubmitSpy.mockImplementation(() => Promise.resolve());

        const { req, res } = getMockRequestAndResponse(
            {},
            {
                username: 'test@test.com',
                password: 'abcdefghi',
                confirmPassword: 'abcdefghi',
                regKey: '123ABd$',
                expiry: expiryDate,
            },
            '',
            writeHeadMock,
        );

        await resetPassword(req, res);

        expect(forgotPasswordSubmitSpy).toHaveBeenCalled();
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/resetPasswordSuccess',
        });
    });

    it('should error when the reset password fails', async () => {
        forgotPasswordSubmitSpy.mockImplementation(() => Promise.reject());

        const mockUserCookieValue = {
            inputChecks: [
                {
                    inputValue: '',
                    id: 'password',
                    error: 'There was a problem creating your account',
                },
            ],
        };

        const { req, res } = getMockRequestAndResponse(
            {},
            {
                username: 'test@test.com',
                password: 'abcdefghi',
                confirmPassword: 'abcdefghi',
                regKey: '123ABd$',
                expiry: expiryDate,
            },
            '',
            writeHeadMock,
        );

        await resetPassword(req, res);

        expect(setCookieSpy).toHaveBeenCalledWith(
            'localhost',
            USER_COOKIE,
            JSON.stringify(mockUserCookieValue),
            req,
            res,
        );
    });
});
