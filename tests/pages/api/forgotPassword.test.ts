import forgotPassword from "src/pages/api/forgotPassword"
import { getMockRequestAndResponse } from "tests/testData/mockData"

const writeHeadMock = jest.fn();

describe('forgotPassword', () => {
    it('redirects the user to reset confirmation given a valid email address format', async () => {
        const { req, res } = getMockRequestAndResponse(
            {},
            {
                email: 'test@test.com',
            },
            '',
            writeHeadMock,
        );
        await forgotPassword(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/resetConfirmation',
        });
    });

    it('redirects the user to forgot password  given a invalid email address format', async () => {
        const { req, res } = getMockRequestAndResponse(
            {},
            {
                email: 'test@test',
            },
            '',
            writeHeadMock,
        );
        await forgotPassword(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/forgotPassword',
        });
    });
})