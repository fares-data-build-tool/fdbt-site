import { NextApiResponse } from 'next';
import { updateSessionAttribute } from '../../utils/sessions';
import { NUMBER_OF_PRODUCTS_ATTRIBUTE } from '../../constants/index';
import { NextApiRequestWithSession } from '../../interfaces';
import { redirectToError, redirectTo } from './apiUtils';
import { isSessionValid } from './service/validator';
import { InputCheck } from '../howManyProducts';

export const isNumberOfProductsInvalid = (req: NextApiRequestWithSession): InputCheck => {
    const { numberOfProductsInput = '' } = req.body;
    const inputAsNumber = Number(numberOfProductsInput);
    let error;
    if (numberOfProductsInput === '' || Number.isNaN(inputAsNumber)) {
        error = 'Enter a number';
    } else if (!Number.isInteger(inputAsNumber) || inputAsNumber > 10 || inputAsNumber < 1) {
        error = 'Enter a whole number between 1 and 10';
    } else {
        error = '';
    }
    const inputCheck = { numberOfProductsInput, error };
    return inputCheck;
};

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const userInputValidity = isNumberOfProductsInvalid(req);
        if (userInputValidity.error !== '') {
            const numberOfProductsCookieValue = JSON.stringify(userInputValidity);
            updateSessionAttribute(req, NUMBER_OF_PRODUCTS_ATTRIBUTE, { body: numberOfProductsCookieValue });
            redirectTo(res, '/howManyProducts');
            return;
        }
        const numberOfProductsCookieValue = JSON.stringify({
            numberOfProductsInput: userInputValidity.numberOfProductsInput,
        });

        if (userInputValidity.numberOfProductsInput === '1') {
            redirectTo(res, '/productDetails');
            return;
        }

        updateSessionAttribute(req, NUMBER_OF_PRODUCTS_ATTRIBUTE, { body: numberOfProductsCookieValue });
        redirectTo(res, '/multipleProducts');
    } catch (error) {
        const message = 'There was a problem inputting the number of products:';
        redirectToError(res, message, error);
    }
};
