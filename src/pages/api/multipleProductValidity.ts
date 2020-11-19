import { NextApiRequest, NextApiResponse } from 'next';
import { isSessionValid, isValidTime } from './apiUtils/validator';
import { redirectTo, redirectToError } from './apiUtils';
import { NextApiRequestWithSession } from '../../interfaces';
import { MULTIPLE_PRODUCT_ATTRIBUTE } from '../../constants/index';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';

export interface MultipleProductAttribute {
    products: Product[];
    endTimesList?: string[];
}

export interface Product {
    productName: string;
    productNameId?: string;
    productPrice: string;
    productPriceId?: string;
    productDuration: string;
    productDurationId?: string;
    productValidity?: string;
    productValidityError?: string;
    productValidityId?: string;
    productDurationUnits?: string;
    serviceEndTime?: string;
}

export const isValidInputValidity = (durationInput: string): boolean =>
    ['24hr', 'endOfCalendarDay', 'serviceDay'].includes(durationInput);

export const addErrorsIfInvalid = (req: NextApiRequest, rawProduct: Product, index: number): Product => {
    const validity = req.body[`validity-option-${index}`];
    const validityEndTime = req.body[`validity-end-time-${index}`];
    let error = '';
    let errorId = '';

    if (
        !validity ||
        (validity === 'serviceDay' && validityEndTime === '') ||
        (validity === 'serviceDay' && validityEndTime !== '' && !isValidTime(validityEndTime))
    ) {
        if (!validity) {
            error = 'Select one of the three validity options';
            errorId = `validity-option-${index}`;
        } else if (validity === 'serviceDay' && validityEndTime === '') {
            error = 'Specify an end time for service day';
            errorId = `validity-end-time-${index}`;
        }

        if (validity === 'serviceDay' && validityEndTime && !isValidTime(validityEndTime)) {
            if (validityEndTime === '2400') {
                error = '2400 is not a valid input. Use 0000.';
                errorId = `validity-end-time-${index}`;
            } else {
                error = 'Time must be in 2400 format';
                errorId = `validity-end-time-${index}`;
            }
        }

        return {
            productName: rawProduct.productName,
            productNameId: rawProduct.productNameId,
            productPrice: rawProduct.productPrice,
            productPriceId: rawProduct.productPriceId,
            productDuration: rawProduct.productDuration,
            productDurationId: rawProduct.productDurationId,
            productValidityError: error,
            productValidityId: errorId,
            productDurationUnits: rawProduct.productDurationUnits,
            productValidity: validity || '',
            serviceEndTime: validity === 'serviceDay' ? validityEndTime : '',
        };
    }

    return {
        productName: rawProduct.productName,
        productPrice: rawProduct.productPrice,
        productDuration: rawProduct.productDuration,
        productDurationUnits: rawProduct.productDurationUnits,
        productValidity: validity,
        serviceEndTime: validity === 'serviceDay' ? validityEndTime : '',
    };
};

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
        }

        const multiProductAttribute = getSessionAttribute(req, MULTIPLE_PRODUCT_ATTRIBUTE);

        if (!multiProductAttribute) {
            throw new Error('Necessary cookies not found for multiple product validity API');
        }

        const rawProducts: Product[] = multiProductAttribute.products;
        const products: Product[] = rawProducts.map((rawProduct, i) => addErrorsIfInvalid(req, rawProduct, i));

        updateSessionAttribute(req, MULTIPLE_PRODUCT_ATTRIBUTE, {
            products,
            endTimesList: (req.body.listofEndTimes && req.body.listOfEndTimes.split(',')) || [],
        });

        if (products.some(el => el.productValidityError)) {
            redirectTo(res, '/multipleProductValidity');
            return;
        }

        redirectTo(res, '/ticketConfirmation');
    } catch (error) {
        const message = 'There was a problem collecting the user defined products:';
        redirectToError(res, message, 'api.multipleProductValidity', error);
    }
};
