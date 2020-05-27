import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import * as yup from 'yup';
import {
    redirectToError,
    redirectTo,
    unescapeAndDecodeCookie,
    redirectOnFareType,
    setCookieOnResponseObject,
    getDomain,
} from './apiUtils/index';
import { PASSENGER_TYPE_COOKIE, FARE_TYPE_COOKIE } from '../../constants/index';
import { isSessionValid } from './service/validator';

export interface ExtractedValidationError {
    input: string;
    message: string;
}

const validAgeInputRegex = new RegExp('^([0-9]|[1-8][0-9]|9[0-9]|1[0-4][0-9]|150)$');

const radioButtonError = 'Choose one of the options below';
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
        proofDocuments: yup.string().when('proof', { is: 'yes', then: yup.string().required(proofSelectionError) }),
    })
    .required();

export const removeWhitespaceFromTextInput = (req: NextApiRequest): { [key: string]: string } => {
    const filteredReqBody: { [key: string]: string } = {};
    Object.entries(req.body).forEach(entry => {
        if (entry[0] === 'ageRangeMin' || entry[0] === 'ageRangeMax') {
            const input = entry[1] as string;
            const strippedInput = input.replace(/\s+/g, '');
            filteredReqBody[entry[0]] = strippedInput;
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

        let errors: ExtractedValidationError[] = [];

        const filteredReqBody = removeWhitespaceFromTextInput(req);

        try {
            await passengerTypeDetailsSchema.validate(filteredReqBody, { abortEarly: false });
        } catch (validationErrors) {
            const validityErrors: yup.ValidationError = validationErrors;
            errors = validityErrors.inner.map(error => ({ input: error.path, message: error.message }));
        }

        if (errors.length === 0) {
            const passengerTypeCookieValue = JSON.stringify({ passengerType, ...filteredReqBody });
            setCookieOnResponseObject(getDomain(req), PASSENGER_TYPE_COOKIE, passengerTypeCookieValue, req, res);
            redirectOnFareType(req, res);
            return;
        }
        const passengerTypeCookieValue = JSON.stringify({ errors, passengerType });
        setCookieOnResponseObject(getDomain(req), PASSENGER_TYPE_COOKIE, passengerTypeCookieValue, req, res);
        redirectTo(res, '/definePassengerType');
    } catch (error) {
        const message = 'There was a problem in the definePassengerType API.';
        redirectToError(res, message, error);
    }
};
