import { getMockRequestAndResponse } from '../../testData/mockData';
import salesOfferPackages, { SalesOfferPackageInfoWithErrors } from '../../../src/pages/api/salesOfferPackages';
import * as session from '../../../src/utils/sessions';
import { SalesOfferPackageInfo } from '../../../src/pages/describeSalesOfferPackage';
import { SOP_INFO_ATTRIBUTE } from '../../../src/constants';
import { ErrorInfo } from '../../../src/interfaces';

jest.mock('../../../src/utils/sessions.ts');

describe('salesOfferPackages', () => {
    const mockErrorObject: ErrorInfo = { errorMessage: expect.any(String), id: expect.any(String) };
    const writeHeadMock = jest.fn();
    const updateSessionAttributeSpy = jest.spyOn(session, 'updateSessionAttribute');

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('redirects back to /salesOfferPackages if there are no options selected', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        salesOfferPackages(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/salesOfferPackages',
        });
    });

    it('redirects back to /salesOfferPackages if only one purchaseLocation is selected', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                purchaseLocation: 'OnBoard',
            },
            mockWriteHeadFn: writeHeadMock,
        });
        const expectedSessionAttributeCall: SalesOfferPackageInfoWithErrors = {
            purchaseLocation: ['OnBoard'],
            ticketFormat: [],
            paymentMethod: [],
            errors: [mockErrorObject, mockErrorObject],
        };

        salesOfferPackages(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, SOP_INFO_ATTRIBUTE, expectedSessionAttributeCall);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/salesOfferPackages',
        });
    });

    it('redirects back to /salesOfferPackages if only one paymentMethod is selected', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                paymentMethod: 'Cash',
            },
            mockWriteHeadFn: writeHeadMock,
        });
        const expectedSessionAttributeCall: SalesOfferPackageInfoWithErrors = {
            purchaseLocation: [],
            ticketFormat: [],
            paymentMethod: ['Cash'],
            errors: [mockErrorObject, mockErrorObject],
        };

        salesOfferPackages(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, SOP_INFO_ATTRIBUTE, expectedSessionAttributeCall);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/salesOfferPackages',
        });
    });

    it('redirects back to /salesOfferPackages if only one ticketFormat is selected', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ticketFormat: 'Paper Ticket',
            },
            mockWriteHeadFn: writeHeadMock,
        });
        const expectedSessionAttributeCall: SalesOfferPackageInfoWithErrors = {
            purchaseLocation: [],
            ticketFormat: ['Paper Ticket'],
            paymentMethod: [],
            errors: [mockErrorObject, mockErrorObject],
        };

        salesOfferPackages(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, SOP_INFO_ATTRIBUTE, expectedSessionAttributeCall);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/salesOfferPackages',
        });
    });

    it('redirects back to /salesOfferPackages if one selection is missing', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                purchaseLocation: ['OnBoard', 'Online Account'],
                ticketFormat: ['Paper Ticket', 'Debit/Credit card'],
            },
            mockWriteHeadFn: writeHeadMock,
        });
        const expectedSessionAttributeCall: SalesOfferPackageInfoWithErrors = {
            purchaseLocation: ['OnBoard', 'Online Account'],
            ticketFormat: ['Paper Ticket', 'Debit/Credit card'],
            paymentMethod: [],
            errors: [mockErrorObject],
        };

        salesOfferPackages(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, SOP_INFO_ATTRIBUTE, expectedSessionAttributeCall);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/salesOfferPackages',
        });
    });

    it('redirects to /describeSalesOfferPackage when at least one option has been selected from each section', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                purchaseLocation: ['OnBoard', 'Online Account'],
                paymentMethod: ['Cash'],
                ticketFormat: ['Paper Ticket', 'Debit/Credit card'],
            },
            mockWriteHeadFn: writeHeadMock,
        });
        const expectedSessionAttributeCall: SalesOfferPackageInfo = {
            purchaseLocation: ['OnBoard', 'Online Account'],
            ticketFormat: ['Paper Ticket', 'Debit/Credit card'],
            paymentMethod: ['Cash'],
        };

        salesOfferPackages(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, SOP_INFO_ATTRIBUTE, expectedSessionAttributeCall);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/describeSalesOfferPackage',
        });
    });
});
