import { getUuidFromCookie, setCookieOnResponseObject } from '../../../src/pages/api/apiUtils/index';
import selectJourneyDirection from '../../../src/pages/api/selectJourneyDirection';
import { getMockRequestAndResponse } from '../../testData/mockData';
import { isSessionValid } from '../../../src/pages/api/service/validator';

describe('selectJourneyDirection', () => {
    const writeHeadMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should return 302 redirect to /selectJourneyDirection when the session is valid, but there is no request body', () => {
        const mockFareTypeCookie = { 'fdbt-fareType': '{"fareType": "single"}' };
        const { req, res } = getMockRequestAndResponse(mockFareTypeCookie, null, {}, writeHeadMock);
        (setCookieOnResponseObject as {}) = jest.fn();
        selectJourneyDirection(req, res);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/selectJourneyDirection',
        });
    });

    it('should return 302 redirect to /inputMethod when session is valid, request body is present with inbound and outbound journeys selected', () => {
        (isSessionValid as {}) = jest.fn().mockReturnValue(true);
        (getUuidFromCookie as {}) = jest.fn().mockReturnValue({ uuid: 'testUuid' });
        const mockFareTypeCookie = {
            'fdbt-journey': '{errorMessages: [], inboundJourney: "abc", outboundJourney: "def"}',
        };
        const { req, res } = getMockRequestAndResponse(
            mockFareTypeCookie,
            { journeyPattern: 'test_journey', inboundJourney: 'inbound', outboundJourney: 'outbound' },
            {},
            writeHeadMock,
        );
        (setCookieOnResponseObject as {}) = jest.fn();
        selectJourneyDirection(req, res);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/inputMethod',
        });
    });

    it('should return 302 redirect to /selectJourneyDirection when session is valid, request body is not present', () => {
        (isSessionValid as {}) = jest.fn().mockReturnValue(true);
        (getUuidFromCookie as {}) = jest.fn().mockReturnValue({ uuid: 'testUuid' });
        const mockFareTypeCookie = { 'fdbt-fareType': '{"fareType": "returnSingle"}' };
        const { req, res } = getMockRequestAndResponse(
            mockFareTypeCookie,
            { journeyPattern: 'test_journey' },
            {},
            writeHeadMock,
        );
        (setCookieOnResponseObject as {}) = jest.fn();
        selectJourneyDirection(req, res);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/selectJourneyDirection',
        });
    });

    it('should return 302 redirect to /error when session is not valid', () => {
        const { req, res } = getMockRequestAndResponse({ operator: null }, null, {}, writeHeadMock);
        selectJourneyDirection(req, res);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/error',
        });
    });
});
