import { NextApiResponse } from 'next';
import { MULTIPLE_PRODUCT_ATTRIBUTE } from '../../constants/index';
import { isSessionValid } from './service/validator';
import { redirectToError, redirectTo } from './apiUtils';
import {
    removeExcessWhiteSpace,
    checkProductNameIsValid,
    checkPriceIsValid,
    checkDurationIsValid,
} from './service/inputValidator';
import { NextApiRequestWithSession, ErrorInfo } from '../../interfaces';
import { updateSessionAttribute } from '../../utils/sessions';

export interface MultiProduct {
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

export const getErrorsForCookie = (validationResult: MultiProduct[]): ErrorInfo[] => {
    const errorsForCookie: ErrorInfo[] = [];

    validationResult.forEach(product => {
        if (product.productDurationError) {
            errorsForCookie.push({
                errorMessage: product.productDurationError,
                id: product.productDurationId,
            });
        }
        if (product.productNameError) {
            errorsForCookie.push({
                errorMessage: product.productNameError,
                id: product.productNameId,
            });
        }
        if (product.productPriceError) {
            errorsForCookie.push({
                errorMessage: product.productPriceError,
                id: product.productPriceId,
            });
        }
    });

    return errorsForCookie;
};

export const containsErrors = (products: MultiProduct[]): boolean => {
    return products.some(
        product => product.productNameError || product.productPriceError || product.productDurationError,
    );
};

export const checkProductDurationsAreValid = (products: MultiProduct[]): MultiProduct[] => {
    const productsWithErrors: MultiProduct[] = products.map(product => {
        const { productDuration } = product;
        const trimmedDuration = removeExcessWhiteSpace(productDuration);
        const productDurationError = checkDurationIsValid(trimmedDuration);

        if (productDurationError) {
            return {
                ...product,
                productDurationError,
            };
        }

        return product;
    });

    return productsWithErrors;
};

export const checkProductPricesAreValid = (products: MultiProduct[]): MultiProduct[] => {
    const productsWithErrors: MultiProduct[] = products.map(product => {
        const { productPrice } = product;
        const trimmedPrice = removeExcessWhiteSpace(productPrice);
        const productPriceError = checkPriceIsValid(trimmedPrice);

        if (productPriceError) {
            return {
                ...product,
                productPriceError,
            };
        }

        return product;
    });

    return productsWithErrors;
};

export const checkProductNamesAreValid = (products: MultiProduct[]): MultiProduct[] => {
    const productsWithErrors: MultiProduct[] = products.map(product => {
        const { productName } = product;
        const trimmedProductName = removeExcessWhiteSpace(productName);
        const productNameError = checkProductNameIsValid(trimmedProductName);

        if (productNameError) {
            return {
                ...product,
                productNameError,
            };
        }

        return product;
    });

    return productsWithErrors;
};

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const arrayedRequest = Object.entries(req.body);
        const multipleProducts: MultiProduct[] = [];

        let count = 0;

        while (arrayedRequest.length > 0) {
            const productName = String(arrayedRequest[0][1]);
            const productPrice = String(arrayedRequest[1][1]);
            const productDuration = String(arrayedRequest[2][1]);
            const productNameId = `multiple-product-name-input-${count}`;
            const productPriceId = `multiple-product-price-input-${count}`;
            const productDurationId = `multiple-product-duration-input-${count}`;
            const product: MultiProduct = {
                productName,
                productNameId,
                productPrice,
                productPriceId,
                productDuration,
                productDurationId,
            };
            multipleProducts.push(product);
            arrayedRequest.splice(0, 3);

            count += 1;
        }

        const nameValidationResult: MultiProduct[] = checkProductNamesAreValid(multipleProducts);
        const priceValidationResult: MultiProduct[] = checkProductPricesAreValid(nameValidationResult);
        const fullValidationResult: MultiProduct[] = checkProductDurationsAreValid(priceValidationResult);

        if (containsErrors(fullValidationResult)) {
            const errors: ErrorInfo[] = getErrorsForCookie(fullValidationResult);

            updateSessionAttribute(req, MULTIPLE_PRODUCT_ATTRIBUTE, {
                body: { errors, userInput: multipleProducts },
            });
            redirectTo(res, '/multipleProducts');
            return;
        }

        updateSessionAttribute(req, MULTIPLE_PRODUCT_ATTRIBUTE, { body: { userInput: multipleProducts } });

        redirectTo(res, '/multipleProductValidity');
    } catch (error) {
        const message = 'There was a problem inputting the product name, price and/or duration:';
        redirectToError(res, message, error);
    }
};
