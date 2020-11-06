import * as sessions from '../../../src/utils/sessions';
import { getMockRequestAndResponse, mockTimeRestrictionsInputErrors } from '../../testData/mockData';
import { FARE_TYPE_ATTRIBUTE, TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE } from '../../../src/constants';
import { TimeRestriction } from '../../../src/interfaces';
import defineTimeRestrictions from '../../../src/pages/api/defineTimeRestrictions';

describe('defineTimeRestrictions', () => {
    const writeHeadMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should throw an error and redirect to the error page when the session is invalid', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: { operator: null },
            body: {},
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        defineTimeRestrictions(req, res);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/error',
        });
    });

    it('should throw an error and redirect to the error page when the FARE_TYPE_ATTRIBUTE is missing', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            session: { [FARE_TYPE_ATTRIBUTE]: null },
        });
        defineTimeRestrictions(req, res);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/error',
        });
    });

    it('should set the TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE and redirect to fare confirmation when no errors are found', () => {
        const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
        const mockReqBody = {
            validDaysSelected: 'Yes',
            validDays: 'tuesday',
        };
        const mockAttributeValue: TimeRestriction = {
            validDays: ['tuesday'],
        };
        const { req, res } = getMockRequestAndResponse({
            cookieValues: { fareType: 'single' },
            body: mockReqBody,
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        defineTimeRestrictions(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE,
            mockAttributeValue,
        );
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/fareConfirmation',
        });
    });

    it.each([
        [
            {
                validDaysSelected: 'Yes',
            },
            {
                validDaysSelected: 'Yes',

                errors: mockTimeRestrictionsInputErrors,
            },
        ],
    ])(
        'should set the TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE and redirect to itself (i.e. /defineTimeRestrictions) when errors are present due to %s',
        (mockUserInput, mockAttributeValue) => {
            const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
            const { req, res } = getMockRequestAndResponse({
                cookieValues: {},
                body: mockUserInput,
                uuid: {},
                mockWriteHeadFn: writeHeadMock,
            });
            defineTimeRestrictions(req, res);
            expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
                req,
                TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE,
                mockAttributeValue,
            );
            expect(writeHeadMock).toBeCalledWith(302, {
                Location: '/defineTimeRestrictions',
            });
        },
    );
});
