import { NextApiRequest, NextApiResponse } from 'next';
import { NUMBER_OF_PRODUCTS_COOKIE, MULTIPLE_PRODUCT_COOKIE } from '../../constants/index';
import { isSessionValid } from './service/validator';
import { redirectToError } from './apiUtils';
import { ProductValidity } from '../multipleProductValidity';

export const isInputValid = (req: NextApiRequest): ProductValidity[] => {
    const numberOfProducts = Number(JSON.parse(req.body.cookies[NUMBER_OF_PRODUCTS_COOKIE]).numberOfProductsInput);
    const limiter = new Array(numberOfProducts);
    const response: ProductValidity[] = [];
    for (let i = 0; i < limiter.length; i += 1) {
        let selection = req.body[`validity-row${i}`];
        let error = '';
        if (!selection) {
            selection = '';
            error = 'Select one of the two validity options';
        }
        const check = { validity: selection, error };
        response.push(check);
    }
    return response;
};

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (!req.body.cookies[NUMBER_OF_PRODUCTS_COOKIE] || !req.body.cookies[MULTIPLE_PRODUCT_COOKIE]) {
            throw new Error(
                'ERROR! Necessary cookies not found. NUMBER_OF_PRODUCTS_COOKIE and/or MULTIPLE_PRODUCT_COOKIE are missing',
            );
        }

        const userInputValidity = isInputValid(req);
        // if (!req.body.stageNameInput || req.body.stageNameInput.length === 0) {
        //     throw new Error('No stage name input received from Stage Names page.');
        // }
        // const userInputValidity = isStageNameValid(req);
        // if (!userInputValidity.some(el => el.Error !== '')) {
        //     const stageNameCookieValue = JSON.stringify(req.body.stageNameInput);
        //     setCookieOnResponseObject(getDomain(req), STAGE_NAMES_COOKIE, stageNameCookieValue, req, res);
        //     redirectTo(res, '/priceEntry');
        // } else {
        //     const validationCookieValue = JSON.stringify(userInputValidity);
        //     setCookieOnResponseObject(getDomain(req), STAGE_NAME_VALIDATION_COOKIE, validationCookieValue, req, res);
        //     redirectTo(res, '/stageNames');
    } catch (error) {
        const message = 'There was a problem entering stage names:';
        redirectToError(res, message, error);
    }
};
