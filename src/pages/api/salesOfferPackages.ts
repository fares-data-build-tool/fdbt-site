import { NextApiResponse } from 'next';
import { isArray } from 'lodash';
import { redirectTo, redirectToError } from './apiUtils';
import { updateSessionAttribute } from '../../utils/sessions';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { SOP_INFO_ATTRIBUTE } from '../../constants';
import { purchaseLocationsList, paymentMethodsList, ticketFormatsList } from '../salesOfferPackages';

export interface SalesOfferPackageInfo {
    purchaseLocation: string[];
    paymentMethod: string[];
    ticketFormat: string[];
}

export interface SalesOfferPackageInfoWithErrors extends SalesOfferPackageInfo {
    errors: ErrorInfo[];
}

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    const errors: ErrorInfo[] = [];

    try {
        let { purchaseLocation, paymentMethod, ticketFormat } = req.body;

        if (!purchaseLocation) {
            errors.push({
                errorMessage: 'Select at least one ticket purchase location',
                id: purchaseLocationsList.id,
            });
        }

        if (!paymentMethod) {
            errors.push({
                errorMessage: 'Select at least one ticket payment method',
                id: paymentMethodsList.id,
            });
        }

        if (!ticketFormat) {
            errors.push({
                errorMessage: 'Select at least one ticket media format',
                id: ticketFormatsList.id,
            });
        }

        if (purchaseLocation && !isArray(purchaseLocation)) {
            purchaseLocation = purchaseLocation.split();
        }

        if (paymentMethod && !isArray(paymentMethod)) {
            paymentMethod = paymentMethod.split();
        }

        if (ticketFormat && !isArray(ticketFormat)) {
            ticketFormat = ticketFormat.split();
        }

        const salesOfferPackageInfo: SalesOfferPackageInfo = {
            purchaseLocation: purchaseLocation || [],
            paymentMethod: paymentMethod || [],
            ticketFormat: ticketFormat || [],
        };

        if (errors.length > 0) {
            (salesOfferPackageInfo as SalesOfferPackageInfoWithErrors).errors = errors;
            updateSessionAttribute(req, SOP_INFO_ATTRIBUTE, salesOfferPackageInfo);

            redirectTo(res, '/salesOfferPackages');
            return;
        }

        updateSessionAttribute(req, SOP_INFO_ATTRIBUTE, salesOfferPackageInfo);

        redirectTo(res, '/describeSalesOfferPackage');
    } catch (err) {
        const message = 'There was a problem in the sales offer package API.';
        redirectToError(res, message, err);
    }
};
