import { NextApiResponse } from 'next';
import { isArray } from 'lodash';
import { redirectTo, redirectToError } from './apiUtils';
import { updateSessionAttribute } from '../../utils/sessions';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { SALES_OFFER_PACKAGES_ATTRIBUTE } from '../../constants';
import { ticketsPurchasedList, ticketPaymentMethodsList, ticketFormatsList } from '../salesOfferPackages';

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    const errors: ErrorInfo[] = [];

    try {
        if (Object.keys(req.body).length === 0) {
            errors.push({
                id: '',
                errorMessage: 'Select at least one item for each section',
            });

            updateSessionAttribute(req, SALES_OFFER_PACKAGES_ATTRIBUTE, {
                body: { errors },
            });

            redirectTo(res, '/salesOfferPackages');
            return;
        }

        let { ticketsPurchasedFrom, ticketPayments, ticketFormats } = req.body;

        if (!ticketsPurchasedFrom) {
            errors.push({
                errorMessage: 'Select at least one option for ticket purchase',
                id: ticketsPurchasedList.id,
            });
        }

        if (!ticketPayments) {
            errors.push({
                errorMessage: 'Select at least one ticket payment',
                id: ticketPaymentMethodsList.id,
            });
        }

        if (!ticketFormats) {
            errors.push({
                errorMessage: 'Select at least one ticket format',
                id: ticketFormatsList.id,
            });
        }

        if (ticketsPurchasedFrom && !isArray(ticketsPurchasedFrom)) {
            ticketsPurchasedFrom = ticketsPurchasedFrom.split();
        }

        if (ticketPayments && !isArray(ticketPayments)) {
            ticketPayments = ticketPayments.split();
        }

        if (ticketFormats && !isArray(ticketFormats)) {
            ticketFormats = ticketFormats.split();
        }

        if (errors.length > 0) {
            updateSessionAttribute(req, SALES_OFFER_PACKAGES_ATTRIBUTE, {
                body: { errors, ticketsPurchasedFrom, ticketPayments, ticketFormats },
            });

            redirectTo(res, '/salesOfferPackages');
            return;
        }

        updateSessionAttribute(req, SALES_OFFER_PACKAGES_ATTRIBUTE, {
            body: { errors: [], ticketsPurchasedFrom, ticketPayments, ticketFormats },
        });

        redirectTo(res, '/describeSalesOfferPackage');
    } catch (err) {
        const message = 'There was a problem in the sales offer package API.';
        redirectToError(res, message, err);
    }
};
