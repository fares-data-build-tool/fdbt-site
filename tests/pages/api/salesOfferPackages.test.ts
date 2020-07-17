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
                purchaseLocations: 'OnBoard',
            },
            mockWriteHeadFn: writeHeadMock,
        });
        const expectedSessionAttributeCall: SalesOfferPackageInfoWithErrors = {
            purchaseLocations: ['OnBoard'],
            ticketFormats: [],
            paymentMethods: [],
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
                paymentMethods: 'Cash',
            },
            mockWriteHeadFn: writeHeadMock,
        });
        const expectedSessionAttributeCall: SalesOfferPackageInfoWithErrors = {
            purchaseLocations: [],
            ticketFormats: [],
            paymentMethods: ['Cash'],
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
                ticketFormats: 'Paper Ticket',
            },
            mockWriteHeadFn: writeHeadMock,
        });
        const expectedSessionAttributeCall: SalesOfferPackageInfoWithErrors = {
            purchaseLocations: [],
            ticketFormats: ['Paper Ticket'],
            paymentMethods: [],
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
                purchaseLocations: ['OnBoard', 'Online Account'],
                ticketFormats: ['Paper Ticket', 'Debit/Credit card'],
            },
            mockWriteHeadFn: writeHeadMock,
        });
        const expectedSessionAttributeCall: SalesOfferPackageInfoWithErrors = {
            purchaseLocations: ['OnBoard', 'Online Account'],
            ticketFormats: ['Paper Ticket', 'Debit/Credit card'],
            paymentMethods: [],
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
                purchaseLocations: ['OnBoard', 'Online Account'],
                paymentMethods: ['Cash'],
                ticketFormats: ['Paper Ticket', 'Debit/Credit card'],
            },
            mockWriteHeadFn: writeHeadMock,
        });
        const expectedSessionAttributeCall: SalesOfferPackageInfo = {
            purchaseLocations: ['OnBoard', 'Online Account'],
            ticketFormats: ['Paper Ticket', 'Debit/Credit card'],
            paymentMethods: ['Cash'],
        };

        salesOfferPackages(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, SOP_INFO_ATTRIBUTE, expectedSessionAttributeCall);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/describeSalesOfferPackage',
        });
    });
});
