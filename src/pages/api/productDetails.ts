import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import {
    getDomain,
    getUuidFromCookie,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
    unescapeAndDecodeCookie,
} from './apiUtils';
import { isSessionValid } from './service/validator';
import { ProductInfo } from '../../interfaces';
import { PRODUCT_DETAILS_COOKIE, FARETYPE_COOKIE } from '../../constants';
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

        const cookies = new Cookies(req, res);
        const fareTypeCookie = unescapeAndDecodeCookie(cookies, FARETYPE_COOKIE);
        const fareTypeObject = JSON.parse(fareTypeCookie);

        if (
            !fareTypeObject ||
            !fareTypeObject.fareType ||
            (fareTypeObject.fareType !== 'period' && fareTypeObject.fareType !== 'flatFare')
        ) {
            throw new Error('Failed to retrieve FARE_TYPE_COOKIE info for productDetails API');
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

        if (fareTypeObject.fareType === 'period') {
            const validInputs = JSON.stringify(productDetails);
            setCookieOnResponseObject(getDomain(req), PRODUCT_DETAILS_COOKIE, validInputs, req, res);
            redirectTo(res, '/chooseValidity');
        } else if (fareTypeObject.fareType === 'flatFare') {
            // TODO: Format json object (using template agreed with Giles) and create functionality to dump json into matching data bucket

            redirectTo(res, '/thankyou');
            return;
        }
    } catch (error) {
        const message = 'There was a problem inputting the product name and price.';
        redirectToError(res, message, error);
    }
};
