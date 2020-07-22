import { getMockRequestAndResponse } from '../../testData/mockData';
import salesOfferPackages from '../../../src/pages/api/salesOfferPackages';

import * as session from '../../../src/utils/sessions';

jest.mock('../../../src/utils/sessions.ts');

describe('salesOfferPackages', () => {
    const writeHeadMock = jest.fn();
    const updateSessionAttribute = jest.spyOn(session, 'updateSessionAttribute');

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

    it.only('redirects back to /salesOfferPackages if only one ticket purchased from option is selected', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ticketsPurchasedFrom: 'OnBoard',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        salesOfferPackages(req, res);

        const updateSessionAttributeCall = updateSessionAttribute.mock.calls[0][2];
        expect(updateSessionAttributeCall.body.errors.length).toBe(2);
        expect(updateSessionAttributeCall.body.ticketsPurchasedFrom.length).toBe(1);
        expect(updateSessionAttributeCall.body.ticketsPurchasedFrom[0]).toEqual('OnBoard');
        expect(updateSessionAttribute).toHaveBeenCalled();
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/salesOfferPackages',
        });
    });

    it('redirects back to /salesOfferPackages if only one option in ticket payments is selected', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ticketPayments: 'Cash',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        salesOfferPackages(req, res);

        const updateSessionAttributeCall = updateSessionAttribute.mock.calls[0][2];
        expect(updateSessionAttributeCall.body.errors.length).toBe(2);
        expect(updateSessionAttributeCall.body.ticketPayments.length).toBe(1);
        expect(updateSessionAttributeCall.body.ticketPayments[0]).toEqual('Cash');
        expect(updateSessionAttribute).toHaveBeenCalled();
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/salesOfferPackages',
        });
    });

    it('redirects back to /salesOfferPackages if only one option in ticket formats is selected', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ticketFormats: 'Paper Ticket',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        salesOfferPackages(req, res);

        const updateSessionAttributeCall = updateSessionAttribute.mock.calls[0][2];
        expect(updateSessionAttributeCall.body.errors.length).toBe(2);
        expect(updateSessionAttributeCall.body.ticketFormats.length).toBe(1);
        expect(updateSessionAttributeCall.body.ticketFormats[0]).toEqual('Paper Ticket');
        expect(updateSessionAttribute).toHaveBeenCalled();
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/salesOfferPackages',
        });
    });

    it('redirects back to /salesOfferPackages if multiple options selected from each section apart from one', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ticketsPurchasedFrom: ['OnBoard', 'Online Account'],
                ticketFormats: ['Paper Ticket', 'Debit/Credit card'],
            },
            mockWriteHeadFn: writeHeadMock,
        });

        salesOfferPackages(req, res);

        const updateSessionAttributeCall = updateSessionAttribute.mock.calls[0][2];
        expect(updateSessionAttributeCall.body.errors.length).toBe(1);
        expect(updateSessionAttributeCall.body.ticketsPurchasedFrom.length).toBe(2);
        expect(updateSessionAttributeCall.body.ticketsPurchasedFrom).toEqual(['OnBoard', 'Online Account']);
        expect(updateSessionAttributeCall.body.ticketFormats.length).toBe(2);
        expect(updateSessionAttributeCall.body.ticketFormats).toEqual(['Paper Ticket', 'Debit/Credit card']);
        expect(updateSessionAttribute).toHaveBeenCalled();
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/salesOfferPackages',
        });
    });

    it('redirects back to /describeSalesOfferPackage when at least one option has been selected from each section', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ticketsPurchasedFrom: ['OnBoard', 'Online Account'],
                ticketPayments: ['Cash'],
                ticketFormats: ['Paper Ticket', 'Debit/Credit card'],
            },
            mockWriteHeadFn: writeHeadMock,
        });

        salesOfferPackages(req, res);

        const updateSessionAttributeCall = updateSessionAttribute.mock.calls[0][2];
        expect(updateSessionAttributeCall.body.ticketsPurchasedFrom.length).toBe(2);
        expect(updateSessionAttributeCall.body.ticketsPurchasedFrom).toEqual(['OnBoard', 'Online Account']);
        expect(updateSessionAttributeCall.body.ticketFormats.length).toBe(2);
        expect(updateSessionAttributeCall.body.ticketFormats).toEqual(['Paper Ticket', 'Debit/Credit card']);
        expect(updateSessionAttributeCall.body.ticketPayments.length).toBe(1);
        expect(updateSessionAttributeCall.body.ticketPayments).toEqual(['Cash']);
        expect(updateSessionAttribute).toHaveBeenCalled();
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/describeSalesOfferPackage',
        });
    });
});
