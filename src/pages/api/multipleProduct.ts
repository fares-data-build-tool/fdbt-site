import { NextApiRequest, NextApiResponse } from "next";
import Cookies from "cookies";
import { ErrorSummaryInfo } from "../../components/ErrorSummary";
import { MULTIPLE_PRODUCT_COOKIE, NUMBER_OF_PRODUCTS_COOKIE } from "../../constants/index";
import { isSessionValid } from "./service/validator";
import { redirectToError, setCookieOnResponseObject, getDomain, redirectTo } from "./apiUtils";
import { trimInputOfWhiteSpace, isCurrency } from "./periodProduct";

export interface MultipleProduct {
    productName: string;
    productNameId: string;
    productNameError?: string;
    productPrice: string;
    productPriceId: string;
    productPriceError?: string;
    productDuration: string;
    productDurationId: string;
    productDurationError?: string;
}

export const getErrorsForCookie = (validationResult: MultipleProduct[]): ErrorSummaryInfo => {

    const errorsForCookie: ErrorSummaryInfo = {
        errors: []
    }

    validationResult.forEach((product) => {
        if (product.productDurationError) {
            errorsForCookie.errors.push({
                errorMessage: product.productDurationError,
                id: product.productDurationId
            })
        }
        if (product.productNameError) {
            errorsForCookie.errors.push({
                errorMessage: product.productNameError,
                id: product.productNameId
            })
        }
        if (product.productPriceError) {
            errorsForCookie.errors.push({
                errorMessage: product.productPriceError,
                id: product.productPriceId
            })
        }
    })

    return errorsForCookie;
}

export const containsErrors = (products: MultipleProduct[]): boolean => {
    let errorsExist = false;
    products.forEach((product) => {
        if (product.productNameError || product.productPriceError || product.productDurationError) {
            errorsExist = true;
        }
    })

    return errorsExist;
}

export const checkProductDurationsAreValid = (products: MultipleProduct[]): MultipleProduct[] => {

    const productsWithErrors: MultipleProduct[] = products.map((product) => {

        const { productDuration } = product;
        const trimmedDuration = trimInputOfWhiteSpace(productDuration);
        let productDurationError;

        if (trimmedDuration === '') {
            productDurationError = "Product duration cannot be empty.";
        }
        if (Number.isNaN(Number(trimmedDuration))) {
            productDurationError = "Product duration must be a whole, positive number.";
        }
        if (!(Number(trimmedDuration) > 0)) {
            productDurationError = "Product duration cannot be zero or negative."
        }

        if (productDurationError) {
            return {
                ...product,
                productDurationError
            }
        }

        return product;
    });

    return productsWithErrors;
}

export const checkProductPricesAreValid = (products: MultipleProduct[]): MultipleProduct[] => {

    const productsWithErrors: MultipleProduct[] = products.map((product) => {

        const { productPrice } = product;
        const trimmedPrice = trimInputOfWhiteSpace(productPrice);
        let productPriceError;

        if (trimmedPrice === '') {
            productPriceError = "Product price cannot be empty."
        }
        if (!isCurrency(trimmedPrice)) {
            productPriceError = "Product price must be a valid price in pounds and pence.";
        }
        if (Math.sign(Number(trimmedPrice)) === -1) {
            productPriceError = "Product price must postive.";
        }

        if (productPriceError) {
            return {
                ...product,
                productPriceError
            }
        }

        return product;
    });

    return productsWithErrors;
}

export const checkProductNamesAreValid = (products: MultipleProduct[]): MultipleProduct[] => {

    const productsWithErrors: MultipleProduct[] = products.map((product) => {

        const { productName } = product;
        const trimmedProductName = trimInputOfWhiteSpace(productName);
        let productNameError;

        if (trimmedProductName.length > 50) {
            productNameError = "Product name length cannot be greater than 50 characters.";
        }
        if (trimmedProductName.length < 2) {
            productNameError = "Product name length cannot be less than 2 characters.";
        }

        if (productNameError) {
            return {
                ...product,
                productNameError
            }
        }

        return product;
    })

    return productsWithErrors;
}

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const cookies = new Cookies(req, res);
        const numberOfProductsCookie = unescape(decodeURI(cookies.get(NUMBER_OF_PRODUCTS_COOKIE) || ''));
        const numberOfProducts: string = JSON.parse(numberOfProductsCookie).numberOfProductsInput;
        const numberOfReceivedProducts: number = Object.entries(req.body).length / 3;

        if (Number(numberOfProducts) !== numberOfReceivedProducts) {
            throw new Error('Number of products received does not match number given in cookie.');
        }

        const arrayedRequest = Object.entries(req.body);
        const multipleProducts: MultipleProduct[] = [];

        while (arrayedRequest.length > 0) {
            const productName = String(arrayedRequest[0][1]);
            const productPrice = String(arrayedRequest[1][1]);
            const productDuration = String(arrayedRequest[2][1]);
            const productNameId = String(arrayedRequest[0][0]);
            const productPriceId = String(arrayedRequest[1][0]);
            const productDurationId = String(arrayedRequest[2][0]);
            const product: MultipleProduct = {
                productName,
                productNameId,
                productPrice,
                productPriceId,
                productDuration,
                productDurationId,
            }
            multipleProducts.push(product);
            arrayedRequest.splice(0, 3);
        }

        const nameValidationResult: MultipleProduct[] = checkProductNamesAreValid(multipleProducts);
        const priceValidationResult: MultipleProduct[] = checkProductPricesAreValid(nameValidationResult);
        const fullValidationResult: MultipleProduct[] = checkProductDurationsAreValid(priceValidationResult);

        if (containsErrors(fullValidationResult)) {

            const errors: ErrorSummaryInfo = getErrorsForCookie(fullValidationResult);

            setCookieOnResponseObject(getDomain(req), MULTIPLE_PRODUCT_COOKIE, JSON.stringify(errors), req, res);
            redirectTo(res, '/multipleProduct');
            return;
        }

        const validInputs = JSON.stringify(multipleProducts);

        setCookieOnResponseObject(getDomain(req), MULTIPLE_PRODUCT_COOKIE, validInputs, req, res);

        redirectTo(res, '/multiProductValidity');


    } catch (error) {
        const message = 'There was a problem inputting the product name and price:';
        redirectToError(res, message, error);
    }
};
