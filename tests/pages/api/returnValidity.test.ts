import { getMockRequestAndResponse } from '../../testData/mockData';
import returnValidity, {
    returnValiditySchema,
    getErrorIdFromValidityError,
} from '../../../src/pages/api/returnValidity';
import * as sessions from '../../../src/utils/sessions';
import { RETURN_VALIDITY_ATTRIBUTE } from '../../../src/constants';
import { ErrorInfo } from '../../../src/interfaces';

describe('returnValidity', () => {
    const writeHeadMock = jest.fn();
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('returnValiditySchema', () => {
        it.each([
            [{}, false],
            [{ validity: 'No' }, true],
            [{ validity: 'Yes' }, false],
            [{ validity: 'Yes', amount: '5' }, false],
            [{ validity: 'Yes', duration: 'days' }, false],
            [{ validity: 'Yes', amount: '7', duration: 'days' }, true],
            [{ validity: 'Yes', amount: 'abc', duration: 'days' }, false],
            [{ validity: 'Yes', amount: '   ', duration: 'days' }, false],
            [{ validity: 'Yes', amount: '0', duration: 'days' }, false],
            [{ validity: 'Yes', amount: '-17', duration: 'days' }, false],
            [{ validity: 'Yes', amount: '1.74', duration: 'days' }, false],
            [{ validity: 'Yes', amount: '6', duration: 'hello there' }, false],
            [{ validity: 'Yes', amount: '31', duration: 'days' }, true],
            [{ validity: 'Yes', amount: '32', duration: 'days' }, false],
            [{ validity: 'Yes', amount: '53', duration: 'weeks' }, false],
            [{ validity: 'Yes', amount: '52', duration: 'weeks' }, true],
            [{ validity: 'Yes', amount: '73', duration: 'months' }, false],
            [{ validity: 'Yes', amount: '72', duration: 'months' }, true],
            [{ validity: 'Yes', amount: '5', duration: 'years' }, true],
        ])('should validate that %s is %s', (candidate, validity) => {
            const result = returnValiditySchema.isValidSync(candidate);
            expect(result).toEqual(validity);
        });
    });

    describe('getErrorIdFromValidityError', () => {
        it.each([
            ['return-validity-defined', 'validity'],
            ['return-validity-amount', 'amount'],
            ['return-validity-units', 'duration'],
        ])('should return the id as %s when the error path is %s', (expectedId, errorPath) => {
            const actualId = getErrorIdFromValidityError(errorPath);
            expect(actualId).toEqual(expectedId);
        });

        it('should throw an error when the error path does not match a valid input field', () => {
            expect(() => getErrorIdFromValidityError('notValid')).toThrow();
        });
    });

    it('should throw an error and redirect to the error page when the session is invalid', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: { operator: null },
            mockWriteHeadFn: writeHeadMock,
        });
        await returnValidity(req, res);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/error',
        });
    });

    it('should set the RETURN_VALIDITY_ATTRIBUTE and redirect to /selectSalesOfferPackage when no errors are found', async () => {
        const mockPassengerTypeDetails = {
            amount: '6',
            duration: 'weeks',
        };
        const mockBody = {
            ...mockPassengerTypeDetails,
            validity: 'Yes',
        };
        const { req, res } = getMockRequestAndResponse({
            body: mockBody,
            mockWriteHeadFn: writeHeadMock,
        });
        await returnValidity(req, res);
        expect(updateSessionAttributeSpy).toBeCalledWith(req, RETURN_VALIDITY_ATTRIBUTE, mockPassengerTypeDetails);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/selectSalesOfferPackage',
        });
    });

    it('should set the RETURN_VALIDITY_ATTRIBUTE with errors and redirect to itself (i.e. /returnValidity) when there are errors present', async () => {
        const mockReturnValidityDetails = {
            validity: 'Yes',
            amount: '54',
            duration: 'days',
        };
        const mockErrors: ErrorInfo[] = [
            {
                errorMessage: 'Enter a number of days between 1 and 31',
                id: 'return-validity-amount',
                userInput: '54',
            },
        ];
        const { req, res } = getMockRequestAndResponse({
            body: mockReturnValidityDetails,
            mockWriteHeadFn: writeHeadMock,
        });
        await returnValidity(req, res);
        expect(updateSessionAttributeSpy).toBeCalledWith(req, RETURN_VALIDITY_ATTRIBUTE, {
            amount: mockReturnValidityDetails.amount,
            duration: mockReturnValidityDetails.duration,
            errors: mockErrors,
        });
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/returnValidity',
        });
    });
});
