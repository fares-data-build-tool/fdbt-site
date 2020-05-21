import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import * as yup from 'yup';
import {
    redirectToError,
    redirectTo,
    unescapeAndDecodeCookie,
    // setCookieOnResponseObject,
    // getDomain,
} from './apiUtils/index';
import { PASSENGER_TYPE_COOKIE, FARE_TYPE_COOKIE } from '../../constants/index';
import { isSessionValid } from './service/validator';

const validAgeInputRegex = new RegExp('^([0-9]|[1-8][0-9]|9[0-9]|1[0-4][0-9]|150)$');
const radioButtonError = 'Select one of the options for each question';
const ageRangeValidityError = 'Enter a whole number between 0-150';
const ageRangeInputError = 'Enter a minimum or maximum age';
const proofSelectionError = 'Select at least one proof document';

const ageRangeInputSchema = yup
    .string()
    .matches(validAgeInputRegex, { message: ageRangeValidityError, excludeEmptyString: true })
    .required(ageRangeInputError);

export const passengerTypeDetailsSchema = yup
    .object({
        ageRange: yup
            .string()
            .oneOf(['yes', 'no'])
            .required(radioButtonError),
        proof: yup
            .string()
            .oneOf(['yes', 'no'])
            .required(radioButtonError),
        ageRangeMin: yup.string().when('ageRange', {
            is: 'yes',
            then: yup
                .string()
                .when('ageRangeMax', {
                    is: ageRangeMaxValue => !!ageRangeMaxValue,
                    then: ageRangeInputSchema.notRequired(),
                })
                .when('ageRangeMax', {
                    is: ageRangeMaxValue => !ageRangeMaxValue,
                    then: ageRangeInputSchema,
                }),
        }),
        ageRangeMax: yup.string().when('ageRange', {
            is: 'yes',
            then: yup
                .string()
                .when('ageRangeMin', {
                    is: ageRangeMinValue => !!ageRangeMinValue,
                    then: ageRangeInputSchema.notRequired(),
                })
                .when('ageRangeMin', {
                    is: ageRangeMinValue => !ageRangeMinValue,
                    then: ageRangeInputSchema,
                }),
        }),
        proofDocument: yup.string().when('proof', { is: 'yes', then: yup.string().required(proofSelectionError) }),
    })
    .required();

// export const isAgeInputValid = (ageInput: number): string => {
//     let error = '';
//     if (Number.isNaN(ageInput)) {
//         error = 'Enter a number';
//     } else if (ageInput < 0 || ageInput > 150) {
//         error = 'Enter an age between 0-150';
//     }
//     return error;
// };

// export const isTextInputValid = (req: NextApiRequest): {} => {
//     const ageRangeMin = Number(req.body.ageRangeMin);
//     const ageRangeMax = Number(req.body.ageRangeMax);
//     let textInputError = '';
//     let ageRangeMinError = '';
//     let ageRangeMaxError = '';
//     if (ageRangeMin === 0 && ageRangeMax === 0) {
//         textInputError = 'Enter a minimum or maximum age';
//     }
//     ageRangeMinError = isAgeInputValid(ageRangeMin);
//     ageRangeMaxError = isAgeInputValid(ageRangeMax);
//     return { textInputError, ageRangeMinError, ageRangeMaxError };
// };

// export const checkAgeRangeInput = (req: NextApiRequest, errors: {}): {} => {
//     if (req.body.ageRange === 'yes') {
//         const ageRangeInputErrors = isTextInputValid(req);
//         if (Object.values(ageRangeInputErrors).map(error => error !== '')) {
//             return { ...errors, ageRangeInputErrors };
//         }
//     }
//     return errors;
// };

// export const checkCheckboxInput = (req: NextApiRequest, errors: {}, expectedUserInputs: number): {} => {
//     if (req.body.proof === 'yes') {
//         if (Object.keys(req.body).length < expectedUserInputs) {
//             const proofSelectError = 'Select at least one proof document';
//             return { ...errors, proofSelectError };
//         }
//     }
//     return errors;
// };

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        console.log(req.body);

        const cookies = new Cookies(req, res);
        const passengerTypeCookie = unescapeAndDecodeCookie(cookies, PASSENGER_TYPE_COOKIE);
        const fareTypeCookie = unescapeAndDecodeCookie(cookies, FARE_TYPE_COOKIE);
        const { passengerType } = JSON.parse(passengerTypeCookie);
        const { fareType } = JSON.parse(fareTypeCookie);

        if (!passengerType || !fareType) {
            throw new Error('Failed to retrieve the necessary cookies for the definePassengerType API');
        }

        if (!req.body) {
            throw new Error('Could not extract the relevant data from the request.');
        }

        let validationError = '';

        try {
            const validationResult = await passengerTypeDetailsSchema.validate(req.body);
            console.log({ validationResult });
        } catch (ValidationError) {
            validationError = ValidationError.message;
        }

        // let errors: {} = {};

        // if (!req.body.ageRange || !req.body.proof) {
        //     const radioButtonError = 'Select one of the options';

        //     if (!req.body.ageRange && !req.body.proof) {
        //         errors = { ageRangeError: radioButtonError, proofError: radioButtonError };
        //     } else if (req.body.ageRange && !req.body.proof) {
        //         errors = { proofError: radioButtonError };
        //         errors = checkAgeRangeInput(req, errors);
        //     } else if (!req.body.ageRange && req.body.proof) {
        //         errors = { ageRangeError: radioButtonError };
        //         errors = checkCheckboxInput(req, errors, 4);
        //     }

        //     // console.log({ errors });

        //     const passengerTypeCookieValue = JSON.stringify({ passengerType, errors });
        //     setCookieOnResponseObject(getDomain(req), PASSENGER_TYPE_COOKIE, passengerTypeCookieValue, req, res);

        //     redirectTo(res, '/definePassengerType');
        //     return;
        // }

        // if (req.body.ageRange === 'no' && req.body.proof === 'no') {
        //     const passengerTypeCookieValue = JSON.stringify({ passengerType });
        //     setCookieOnResponseObject(getDomain(req), PASSENGER_TYPE_COOKIE, passengerTypeCookieValue, req, res);
        //     redirectTo(res, '/definePassengerType');
        //     return;
        // }

        // errors = checkAgeRangeInput(req, errors);
        // errors = checkCheckboxInput(req, errors, 5);

        // // console.log({ errors });

        // const passengerTypeCookieValue = JSON.stringify({
        //     passengerType,
        //     ageRangeMax: req.body.ageRangeMax,
        //     ageRangeMin: req.body.ageRangeMin,
        // });
        // setCookieOnResponseObject(getDomain(req), PASSENGER_TYPE_COOKIE, passengerTypeCookieValue, req, res);
        console.log(validationError);
        redirectTo(res, '/definePassengerType');
    } catch (error) {
        const message = 'There was a problem in the definePassengerType API.';
        redirectToError(res, message, error);
    }
};
