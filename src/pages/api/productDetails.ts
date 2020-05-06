import { NextApiRequest, NextApiResponse } from 'next';
import { getDomain, getUuidFromCookie, redirectTo, redirectToError, setCookieOnResponseObject } from './apiUtils';
import { isSessionValid } from './service/validator';
import { ProductInfo } from '../../interfaces';
import { PRODUCT_DETAILS_COOKIE } from '../../constants';
import { removeExcessWhiteSpace, checkPriceIsValid, checkProductNameIsValid } from './service/inputValidator';

export const checkIfInputInvalid = (
    productDetailsNameInput: string,
    productDetailsPriceInput: string,
    uuid: string,
): ProductInfo => {
    let productNameError = '';
    let productPriceError = '';

    const cleanedNameInput = removeExcessWhiteSpace(productDetailsNameInput);
    const cleanedPriceInput = removeExcessWhiteSpace(productDetailsPriceInput);

    productNameError = checkProductNameIsValid(cleanedNameInput);

    productPriceError = checkPriceIsValid(cleanedPriceInput);

    return {
        uuid,
        productName: cleanedNameInput,
        productPrice: cleanedPriceInput,
        productNameError,
        productPriceError,
    };
};

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const uuid = getUuidFromCookie(req, res);

        const { productDetailsNameInput, productDetailsPriceInput } = req.body;

        const productDetails = checkIfInputInvalid(productDetailsNameInput, productDetailsPriceInput, uuid);

        if (productDetails.productNameError !== '' || productDetails.productPriceError !== '') {
            const invalidInputs = JSON.stringify(productDetails);

            setCookieOnResponseObject(getDomain(req), PRODUCT_DETAILS_COOKIE, invalidInputs, req, res);
            redirectTo(res, '/productDetails');
            return;
        }

        const validInputs = JSON.stringify(productDetails);

        setCookieOnResponseObject(getDomain(req), PRODUCT_DETAILS_COOKIE, validInputs, req, res);

        redirectTo(res, '/chooseValidity');
    } catch (error) {
        const message = 'There was a problem inputting the product name and price:';
        redirectToError(res, message, error);
    }
};
