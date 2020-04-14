import { NextApiRequest, NextApiResponse } from 'next';
import { NUMBER_OF_PRODUCTS_COOKIE } from '../../constants/index';
import { getDomain, setCookieOnResponseObject, redirectToError, redirectTo } from './apiUtils';

export const isNumberOfProductsInvalid = (req: NextApiRequest): boolean => {
    const { numberOfProductsInput } = req.body;

    // eslint-disable-next-line no-restricted-globals
    if (isNaN(numberOfProductsInput)) {
        return true;
    }

    if (!Number.isInteger(Number(numberOfProductsInput))) {
        return true;
    }

    if (numberOfProductsInput > 20 || numberOfProductsInput < 1) {
        return true;
    }

    return false;
};

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!req.body.numberOfProductsInput) {
            redirectTo(res, '/howManyProducts');
            return;
        }

        if (req.body.numberOfProductsInput === 0) {
            throw new Error('0 farestages selected.');
        }

        if (isNumberOfProductsInvalid(req)) {
            throw new Error('Invalid number of farestages selected.');
        }

        const numberOfProducts = req.body.numberOfProductsInput;
        const cookieValue = JSON.stringify({ numberOfProducts });
        setCookieOnResponseObject(getDomain(req), NUMBER_OF_PRODUCTS_COOKIE, cookieValue, req, res);
        redirectTo(res, '/productDetails');
    } catch (error) {
        const message = 'There was a problem inputting the number of fare stages:';
        redirectToError(res, message, error);
    }
};
