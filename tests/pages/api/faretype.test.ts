import http from 'http';
import { getMockRequestAndResponse } from '../../testData/mockData';
// eslint-disable-next-line import/no-unresolved
import fareType from '../../../src/pages/api/fareType';

http.OutgoingMessage.prototype.setHeader = jest.fn();

describe('fareType', () => {
    const writeHeadMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should return 302 redirect to /service when the session is valid, there is no fareType cookie BUT one can be set', () => {
        const { req, res } = getMockRequestAndResponse({}, { fareType: 'single' }, {}, writeHeadMock);
        fareType(req, res);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/service',
        });
    });

    it('should return 302 redirect to /fareType when session is valid but there is neither a service cookie nor has one been set', () => {
        const { req, res } = getMockRequestAndResponse({ service: null }, null, {}, writeHeadMock);
        fareType(req, res);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/fareType',
        });
    });

    it('should return 302 redirect to /error when session is not valid', () => {
        const { req, res } = getMockRequestAndResponse({ operator: null }, null, {}, writeHeadMock);
        fareType(req, res);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/error',
        });
    });
});
