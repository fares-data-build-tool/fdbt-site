import { NextApiRequest, NextApiResponse } from 'next';
import { NUMBER_OF_PRODUCTS_COOKIE, MULTIPLE_PRODUCT_COOKIE } from '../../constants/index';
import { isSessionValid } from './service/validator';
import { redirectToError, setCookieOnResponseObject, getDomain, redirectTo } from './apiUtils';
import { Product } from '../multipleProductValidity';

export const isInputValid = (req: NextApiRequest, products: Product[]): Product[] => {
    const numberOfProducts = Number(JSON.parse(req.cookies[NUMBER_OF_PRODUCTS_COOKIE]).numberOfProductsInput);
    const limiter = new Array(numberOfProducts);
    const response: Product[] = [];
    for (let i = 0; i < limiter.length; i += 1) {
        let validity = req.body[`validity-row${i}`];
        let error = '';
        if (!validity) {
            validity = '';
            error = 'Select one of the two validity options';
        }
        const product = {
            productName: products[i].productName,
            productPrice: products[i].productPrice,
            productDuration: products[i].productDuration,
            productValidity: { validity, error },
        };
        response.push(product);
    }
    return response;
};

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }
        if (!req.cookies[NUMBER_OF_PRODUCTS_COOKIE] || !req.cookies[MULTIPLE_PRODUCT_COOKIE]) {
            throw new Error(
                'Necessary cookies not found. NUMBER_OF_PRODUCTS_COOKIE and/or MULTIPLE_PRODUCT_COOKIE are missing',
            );
        }

        const products = JSON.parse(req.cookies[MULTIPLE_PRODUCT_COOKIE]);

        const userInputValidity = isInputValid(req, products);
        const multipleProductCookieValue = JSON.stringify(userInputValidity);
        setCookieOnResponseObject(getDomain(req), MULTIPLE_PRODUCT_COOKIE, multipleProductCookieValue, req, res);

        if (userInputValidity.some(el => el.productValidity?.error !== '')) {
            redirectTo(res, '/multipleProductValidity');
        }

        // CREATE DECISION DATA AND PUT DATA IN S3

        redirectTo(res, '/thankyou');
    } catch (error) {
        const message = 'There was a problem collecting the user defined products:';
        redirectToError(res, message, error);
    }
};
