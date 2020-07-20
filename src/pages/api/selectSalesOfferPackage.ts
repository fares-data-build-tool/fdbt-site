import { NextApiResponse } from 'next';
import { redirectTo, redirectToError, putUserDataInS3 } from './apiUtils';
import { isSessionValid, isCookiesUUIDMatch } from './service/validator';
import { SALES_OFFER_PACKAGES_ATTRIBUTE } from '../../constants';
import { NextApiRequestWithSession, SelectSalesOfferPackageWithError } from '../../interfaces';
import { updateSessionAttribute } from '../../utils/sessions';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (!isCookiesUUIDMatch(req, res)) {
            throw new Error('Cookie UUIDs do not match');
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            const salesOfferPackagesAttributeError: SelectSalesOfferPackageWithError = {
                errorMessage: 'Choose at least one service from the options',
            };
            updateSessionAttribute(req, SALES_OFFER_PACKAGES_ATTRIBUTE, salesOfferPackagesAttributeError);
            redirectTo(res, `/selectSalesOfferPackage`);
            return;
        }







        
        await putUserDataInS3(matchingJson, uuid);

        redirectTo(res, '/thankyou');
        return;
    } catch (error) {
        const message =
            'There was a problem processing the selected sales offer packages from the salesOfferPackage page:';
        redirectToError(res, message, error);
    }
};
