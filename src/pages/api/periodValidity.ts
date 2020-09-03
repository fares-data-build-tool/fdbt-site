import { NextApiResponse } from 'next';
import Cookies from 'cookies';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import { PRODUCT_DETAILS_ATTRIBUTE, PERIOD_EXPIRY_ATTRIBUTE, DAYS_VALID_ATTRIBUTE } from '../../constants';
import { redirectToError, redirectTo, unescapeAndDecodeCookie } from './apiUtils';
import { isSessionValid } from './apiUtils/validator';
import { NextApiRequestWithSession, ProductData } from '../../interfaces';

export interface PeriodExpiryWithErrors {
    errorMessage: string;
}

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
        }

        if (req.body.periodValid) {
            const { periodValid } = req.body;

            const cookies = new Cookies(req, res);

            const productDetailsCookie = unescapeAndDecodeCookie(cookies, PRODUCT_DETAILS_ATTRIBUTE);
            const daysValidInfo = getSessionAttribute(req, DAYS_VALID_ATTRIBUTE);

            if (productDetailsCookie === '' || !daysValidInfo) {
                throw new Error('Necessary cookies not found for period validity API');
            }

            const { productName, productPrice } = JSON.parse(productDetailsCookie);
            const { daysValid } = daysValidInfo;

            const periodExpiryAttributeValue: ProductData = {
                products: [
                    {
                        productName,
                        productPrice,
                        productDuration: daysValid,
                        productValidity: periodValid,
                    },
                ],
            };

            updateSessionAttribute(req, PERIOD_EXPIRY_ATTRIBUTE, periodExpiryAttributeValue);

            redirectTo(res, '/selectSalesOfferPackage');
        } else {
            const periodExpiryAttributeError: PeriodExpiryWithErrors = {
                errorMessage: 'Choose an option regarding your period ticket validity',
            };
            updateSessionAttribute(req, PERIOD_EXPIRY_ATTRIBUTE, periodExpiryAttributeError);
            redirectTo(res, '/periodValidity');
        }
    } catch (error) {
        const message = 'There was a problem selecting the period validity:';
        redirectToError(res, message, 'api.periodValidity', error);
    }
};
