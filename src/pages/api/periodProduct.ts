import { NextApiRequest, NextApiResponse } from 'next';
import { getDomain, getUuidFromCookie, redirectTo, redirectToError, setCookieOnResponseObject } from './apiUtils';
import { isSessionValid } from './service/validator';
import { PeriodProductType } from '../../interfaces';
import { PERIOD_PRODUCT_COOKIE } from '../../constants';

export const isCurrency = (periodPriceInput: string): boolean => {
    const regex = /^\d+(\.\d{1,2})?$/;
    return regex.test(periodPriceInput);
};

export const trimInputOfWhiteSpace = (input: string): string => {
    return input.trim().replace(/\s+/g, ' ');
};

export const checkIfInputInvalid = (
    periodProductNameInput: string,
    periodProductPriceInput: string,
    uuid: string,
): PeriodProductType => {
    let productNameError = '';
    let productPriceError = '';

    const cleanedNameInput = trimInputOfWhiteSpace(periodProductNameInput);

    if (cleanedNameInput === '') {
        productNameError = 'empty';
    } else if (cleanedNameInput.length < 2) {
        productNameError = 'short';
    }

    if (periodProductPriceInput === '') {
        productPriceError = 'empty';
    } else if (!isCurrency(periodProductPriceInput)) {
        productPriceError = 'notCurrency';
    } else if (!(Number(periodProductPriceInput) > 0)) {
        productPriceError = 'zero';
    }

    return {
        uuid,
        productName: cleanedNameInput,
        productPrice: periodProductPriceInput,
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
        
        const { periodProductNameInput, periodProductPriceInput } = req.body;

        const periodProduct = checkIfInputInvalid(periodProductNameInput, periodProductPriceInput, uuid);

        if (periodProduct.productNameError !== '' || periodProduct.productPriceError !== '') {
            const invalidInputs = JSON.stringify(periodProduct);

            setCookieOnResponseObject(getDomain(req), PERIOD_PRODUCT_COOKIE, invalidInputs, req, res);
            redirectTo(res, '/periodProduct');
            return;
        }

        const validInputs = JSON.stringify(periodProduct);

        setCookieOnResponseObject(getDomain(req), PERIOD_PRODUCT_COOKIE, validInputs, req, res);

        redirectTo(res, '/chooseValidity');
    } catch (error) {
        const message = 'There was a problem inputting the product name and price:';
        redirectToError(res, message, error);
    }
};
