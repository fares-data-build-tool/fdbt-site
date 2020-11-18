import { getMockRequestAndResponse } from '../../testData/mockData';
import multipleProductValidity, { addErrorsIfInvalid, Product } from '../../../src/pages/api/multipleProductValidity';

describe('multipleProductValidity', () => {
    const writeHeadMock = jest.fn();

    describe('addErrorsIfInvalid', () => {
        it('adds errors to incorrect data if there are invalid inputs', () => {
            const { req } = getMockRequestAndResponse({
                body: {
                    'validity-row0': '',
                    'validity-row1': '',
                },
            });

            const userInputIndex = 0;
            const product: Product = {
                productName: 'super ticket',
                productNameId: '',
                productPrice: '3.50',
                productPriceId: '',
                productDuration: '3',
                productDurationId: '',
                serviceEndTime: '',
            };
            const result = addErrorsIfInvalid(req, product, userInputIndex);

            expect(result.productValidity).toBe('');
            expect(result.productValidityError).toBe('Select one of the three validity options');
        });

        it('does not add errors to correct data', () => {
            const { req } = getMockRequestAndResponse({
                body: {
                    'validity-option-0': 'endOfCalendarDay',
                    'validity-option-1': '24hr',
                },
            });

            const userInputIndex = 0;
            const product: Product = {
                productName: 'best ticket',
                productNameId: '',
                productPrice: '30.90',
                productPriceId: '',
                productDuration: '30',
                productDurationId: '',
                productValidity: 'endOfCalendarDay',
            };
            const result = addErrorsIfInvalid(req, product, userInputIndex);

            expect(result.productValidity).toBe('endOfCalendarDay');
            expect(result.productValidityError).toBe('');
        });
    });

    it('redirects back to the multipleProductValidity page if there is no body', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        multipleProductValidity(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/multipleProductValidity',
        });
    });

    it.only('redirects to selectSalesOfferPackage page if all valid', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: { fareZoneName: null },
            body: { 'validity-option-0': '24hr', 'validity-option-1': '24hr', 'validity-option-2': 'endOfCalendarDay' },
            mockWriteHeadFn: writeHeadMock,
        });
        multipleProductValidity(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/ticketConfirmation',
        });
    });

    it('should redirect to the error page if a required cookie is missing', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: { operator: null },
            body: { 'validity-row0': 'endOfCalendarDay' },
            mockWriteHeadFn: writeHeadMock,
        });

        multipleProductValidity(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/error',
        });
    });
});
