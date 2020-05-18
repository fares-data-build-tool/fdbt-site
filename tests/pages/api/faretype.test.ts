import { getMockRequestAndResponse } from '../../testData/mockData';
import fareType from '../../../src/pages/api/fareType';

describe('fareType', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should return 302 redirect to /fareType when session is valid but there is no service cookie set', () => {
        const writeHeadMock = jest.fn();
        const { req, res } = getMockRequestAndResponse({}, null, {}, writeHeadMock);
        fareType(req, res);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/fareType',
        });
    });

    it('should return 302 redirect to /error when session is not valid', () => {
        const writeHeadMock = jest.fn();
        const { req, res } = getMockRequestAndResponse({ operator: null }, null, {}, writeHeadMock);
        fareType(req, res);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/error',
        });
    });
});
