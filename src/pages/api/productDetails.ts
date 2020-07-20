import { NextApiResponse } from 'next';
import { redirectTo, redirectToError } from './apiUtils';
import { isSessionValid } from './service/validator';
import { ProductInfo, NextApiRequestWithSession, ProductData } from '../../interfaces';
import { PRODUCT_DETAILS_ATTRIBUTE } from '../../constants';
import { removeExcessWhiteSpace, checkPriceIsValid, checkProductNameIsValid } from './service/inputValidator';
import { updateSessionAttribute } from '../../utils/sessions';

export const checkIfInputInvalid = (productDetailsNameInput: string, productDetailsPriceInput: string): ProductInfo => {
    let productNameError = '';
    let productPriceError = '';

    const cleanedNameInput = removeExcessWhiteSpace(productDetailsNameInput);
    const cleanedPriceInput = removeExcessWhiteSpace(productDetailsPriceInput);

    productNameError = checkProductNameIsValid(cleanedNameInput);

    productPriceError = checkPriceIsValid(cleanedPriceInput);

    return {
        productName: cleanedNameInput,
        productPrice: cleanedPriceInput,
        productNameError,
        productPriceError,
    };
};

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const { productDetailsNameInput, productDetailsPriceInput } = req.body;

        const productDetails: ProductInfo = checkIfInputInvalid(productDetailsNameInput, productDetailsPriceInput);

        if (productDetails.productNameError !== '' || productDetails.productPriceError !== '') {
            updateSessionAttribute(req, PRODUCT_DETAILS_ATTRIBUTE, productDetails);
            redirectTo(res, '/productDetails');
            return;
        }

        const flatFareProduct: ProductData = {
            products: [{ productName: productDetails.productName, productPrice: productDetails.productPrice }],
        };
        updateSessionAttribute(req, PRODUCT_DETAILS_ATTRIBUTE, { flatFareProduct });
        redirectTo(res, '/selectSalesOfferPackage');
        return;
    } catch (error) {
        const message = 'There was a problem processing the product details.';
        redirectToError(res, message, error);
    }
};
