import { NextApiRequest, NextApiResponse } from 'next';
import * as yup from 'yup';
import { isArray } from 'lodash';
import { redirectToError, redirectTo, redirectOnFareType, retrieveSession, updateSession } from './apiUtils/index';
import { PASSENGER_TYPE_COOKIE, FARE_TYPE_COOKIE } from '../../constants/index';
import { isSessionValid } from './service/validator';

export interface ExtractedValidationError {
    input: string;
    message: string;
}

const radioButtonError = 'Choose one of the options below';
const ageRangeValidityError = 'Enter a whole number between 0-150';
const ageRangeInputError = 'Enter a minimum or maximum age';
const proofSelectionError = 'Select at least one proof document';
const maxAgeLessThanMinError = 'Maximum age cannot be less than minimum age';
const minAgeGreaterThanMaxError = 'Minimum age cannot be greater than maximum age';

const primaryAgeRangeMaxInputSchema = yup
    .number()
    .typeError(ageRangeValidityError)
    .integer(ageRangeValidityError)
    .max(150, ageRangeValidityError);

const primaryAgeRangeMinInputSchema = yup
    .number()
    .typeError(ageRangeValidityError)
    .integer(ageRangeValidityError)
    .min(0, ageRangeValidityError);

export const passengerTypeDetailsSchema = yup
    .object({
        ageRange: yup
            .string()
            .oneOf(['Yes', 'No'])
            .required(radioButtonError),
        proof: yup
            .string()
            .oneOf(['Yes', 'No'])
            .required(radioButtonError),
        ageRangeMin: yup.number().when('ageRange', {
            is: 'Yes',
            then: yup
                .number()
                .when('ageRangeMax', {
                    is: ageRangeMaxValue => !!ageRangeMaxValue,
                    then: primaryAgeRangeMinInputSchema
                        .max(yup.ref('ageRangeMax'), minAgeGreaterThanMaxError)
                        .notRequired(),
                })
                .when('ageRangeMax', {
                    is: ageRangeMaxValue => !ageRangeMaxValue,
                    then: primaryAgeRangeMinInputSchema.max(150, ageRangeValidityError).required(ageRangeInputError),
                }),
        }),
        ageRangeMax: yup.number().when('ageRange', {
            is: 'Yes',
            then: yup
                .number()
                .when('ageRangeMin', {
                    is: ageRangeMinValue => !!ageRangeMinValue,
                    then: primaryAgeRangeMaxInputSchema
                        .min(yup.ref('ageRangeMin'), maxAgeLessThanMinError)
                        .notRequired(),
                })
                .when('ageRangeMin', {
                    is: ageRangeMinValue => !ageRangeMinValue,
                    then: primaryAgeRangeMaxInputSchema.min(0, ageRangeValidityError).required(ageRangeInputError),
                }),
        }),
        proofDocuments: yup.string().when('proof', { is: 'Yes', then: yup.string().required(proofSelectionError) }),
    })
    .required();

export const formatRequestBody = (req: NextApiRequest): {} => {
    const filteredReqBody: { [key: string]: string | string[] } = {};
    Object.entries(req.body).forEach(entry => {
        if (entry[0] === 'ageRangeMin' || entry[0] === 'ageRangeMax') {
            const input = entry[1] as string;
            const strippedInput = input.replace(/\s+/g, '');
            if (strippedInput === '') {
                return;
            }
            filteredReqBody[entry[0]] = strippedInput;
            return;
        }
        if (entry[0] === 'proofDocuments') {
            filteredReqBody[entry[0]] = !isArray(entry[1]) ? [entry[1] as string] : (entry[1] as string[]);
            return;
        }
        filteredReqBody[entry[0]] = entry[1] as string;
    });
    return filteredReqBody;
};

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const { passengerType } = retrieveSession(PASSENGER_TYPE_COOKIE, req);
        const { fareType } = retrieveSession(FARE_TYPE_COOKIE, req);

        if (!passengerType || !fareType) {
            throw new Error('Failed to retrieve the necessary cookies for the definePassengerType API');
        }
        if (!req.body) {
            throw new Error('Could not extract the relevant data from the request.');
        }

        let errors: ExtractedValidationError[] = [];

        const filteredReqBody = formatRequestBody(req);

        try {
            await passengerTypeDetailsSchema.validate(filteredReqBody, { abortEarly: false });
        } catch (validationErrors) {
            const validityErrors: yup.ValidationError = validationErrors;
            errors = validityErrors.inner.map(error => ({
                input: error.path,
                message: error.message,
            }));
        }
        if (errors.length === 0) {
            updateSession(PASSENGER_TYPE_COOKIE, { passengerType, filteredReqBody }, req);
            redirectOnFareType(req, res);
            return;
        }
        updateSession(PASSENGER_TYPE_COOKIE, { errors, passengerType }, req);
        redirectTo(res, '/definePassengerType');
    } catch (error) {
        const message = 'There was a problem in the definePassengerType API.';
        redirectToError(res, message, error);
    }
};
