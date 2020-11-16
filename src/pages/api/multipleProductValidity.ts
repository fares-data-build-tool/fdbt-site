import { NextApiRequest, NextApiResponse } from 'next';
import { isSessionValid } from './apiUtils/validator';
import { redirectTo, redirectToError } from './apiUtils';
import { NextApiRequestWithSession } from '../../interfaces';
import { MULTIPLE_PRODUCT_ATTRIBUTE } from '../../constants/index';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';

export interface MultipleProductAttribute {
    products: Product[];
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
    productDurationUnits?: string;
    productExpiry?: string;
    serviceEndTime?: string;
}

export const addErrorsIfInvalid = (req: NextApiRequest, rawProduct: Product, index: number): Product => {
    const validity = req.body[`validity-option-${index}`];
    const validityEndTime = req.body[`validity-end-time-${index}`];
    let error = '';

    if (!validity || (validity === 'serviceDay' && validityEndTime === '')) {
        if (!validity) {
            error = 'Select one of the two validity options';
        } else if (validity === 'serviceDay' && validityEndTime === '') {
            error = 'Specify an end time for service day';
        }

        return {
            productName: rawProduct.productName,
            productNameId: rawProduct.productNameId,
            productPrice: rawProduct.productPrice,
            productPriceId: rawProduct.productPriceId,
            productDuration: rawProduct.productDuration,
            productDurationId: rawProduct.productDurationId,
            productValidityError: error,
            productDurationUnits: rawProduct.productDurationUnits,
            productExpiry: validity,
            serviceEndTime: validityEndTime,
        };
    }

    return {
        productName: rawProduct.productName,
        productPrice: rawProduct.productPrice,
        productDuration: rawProduct.productDuration,
        productDurationUnits: rawProduct.productDurationUnits,
        productExpiry: validity,
        serviceEndTime: validityEndTime,
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

        updateSessionAttribute(req, MULTIPLE_PRODUCT_ATTRIBUTE, { products });

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
