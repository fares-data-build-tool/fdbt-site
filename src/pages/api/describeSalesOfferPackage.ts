import { NextApiRequest, NextApiResponse } from 'next';
// import { SOP_ATTRIBUTE } from '../../constants/index';
import {
    // setCookieOnResponseObject,
    redirectToError,
    // redirectTo
} from './apiUtils';
import { isSessionValid } from './service/validator';
// import { InputCheck } from '../howManyProducts';

// export const isNumberOfProductsInvalid = (req: NextApiRequest): InputCheck => {
//     const { numberOfProductsInput = '' } = req.body;
//     const inputAsNumber = Number(numberOfProductsInput);
//     let error;
//     if (numberOfProductsInput === '' || Number.isNaN(inputAsNumber)) {
//         error = 'Enter a number';
//     } else if (!Number.isInteger(inputAsNumber) || inputAsNumber > 10 || inputAsNumber < 1) {
//         error = 'Enter a whole number between 1 and 10';
//     } else {
//         error = '';
//     }
//     const inputCheck = { numberOfProductsInput, error };
//     return inputCheck;
// };

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }
    } catch (error) {
        const message = 'There was a problem on the describe sales offer package API.';
        redirectToError(res, message, error);
    }
};
