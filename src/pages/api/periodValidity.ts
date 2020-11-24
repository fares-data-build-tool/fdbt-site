import { NextApiResponse } from 'next';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import { PRODUCT_DETAILS_ATTRIBUTE, PERIOD_EXPIRY_ATTRIBUTE, DURATION_VALID_ATTRIBUTE } from '../../constants';
import { redirectToError, redirectTo } from './apiUtils';
import { isSessionValid, isValidTime } from './apiUtils/validator';
import { NextApiRequestWithSession, ProductData } from '../../interfaces';
import { isProductInfo } from '../productDetails';

export interface PeriodExpiryWithErrors {
    errorMessage: string;
}

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
        }

        console.log('req', req.body);

        if (req.body.periodValid) {
            const { periodValid, serviceEndTime } = req.body;

            const daysValidInfo = getSessionAttribute(req, DURATION_VALID_ATTRIBUTE);
            const productDetailsAttribute = getSessionAttribute(req, PRODUCT_DETAILS_ATTRIBUTE);
            const periodExpiryAttributeError: PeriodExpiryWithErrors = { errorMessage: '' };

            console.log('period', periodValid);
            if (periodValid === 'endOfServiceDay') {
                console.log('abcdef');
                if (serviceEndTime === '') {
                    console.log('get here');
                    periodExpiryAttributeError.errorMessage = 'Specify an end time for service day';
                } else if (!isValidTime(serviceEndTime)) {
                    if (serviceEndTime === '2400') {
                        periodExpiryAttributeError.errorMessage = '2400 is not a valid input. Use 0000.';
                    } else {
                        periodExpiryAttributeError.errorMessage = 'Time must be in 2400 format';
                    }
                }

                updateSessionAttribute(req, PERIOD_EXPIRY_ATTRIBUTE, periodExpiryAttributeError);
                redirectTo(res, '/periodValidity');
                return;
            }

            if (!isProductInfo(productDetailsAttribute) || !daysValidInfo) {
                throw new Error('Necessary session data not found for period validity API');
            }

            const { productName, productPrice } = productDetailsAttribute;
            const timePeriodValid = `${daysValidInfo.amount} ${daysValidInfo.duration}${
                daysValidInfo.amount === '1' ? '' : 's'
            }`;

            console.log('hey');

            const periodExpiryAttributeValue: ProductData = {
                products: [
                    {
                        productName,
                        productPrice,
                        productDuration: timePeriodValid,
                        productValidity: periodValid,
                        serviceEndTime: serviceEndTime || '',
                    },
                ],
            };

            updateSessionAttribute(req, PERIOD_EXPIRY_ATTRIBUTE, periodExpiryAttributeValue);

            redirectTo(res, '/ticketConfirmation');
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
