import { NextApiResponse } from 'next';
import Cookies from 'cookies';
import * as yup from 'yup';
import isArray from 'lodash/isArray';
import { getSessionAttribute } from '../../utils/sessions';
import {
    redirectToError,
    redirectTo,
    unescapeAndDecodeCookie,
    redirectOnFareType,
    setCookieOnResponseObject,
} from './apiUtils/index';
import { PASSENGER_TYPE_COOKIE, FARE_TYPE_COOKIE, GROUP_PASSENGER_TYPES_ATTRIBUTE } from '../../constants/index';
import { isSessionValid } from './apiUtils/validator';
import { NextApiRequestWithSession, ErrorInfo } from '../../interfaces/index';

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

const groupSizeError = 'Enter a whole number between 0-100';
export const minNumberGroupSizeSchema = yup.object({
    minNumber: yup
        .number()
        .typeError(groupSizeError)
        .integer(groupSizeError)
        .min(0, groupSizeError)
        .max(100, groupSizeError),
});
export const maxNumberGroupSizeSchema = yup.object({
    maxNumber: yup
        .number()
        .typeError(groupSizeError)
        .integer(groupSizeError)
        .min(0, groupSizeError)
        .max(100, groupSizeError),
});

export const formatRequestBody = (req: NextApiRequestWithSession): {} => {
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

export const getErrorIdFromValidityError = (errorPath: string): string => {
    switch (errorPath) {
        case 'ageRange':
            return 'define-passenger-age-range';
        case 'proof':
            return 'define-passenger-proof';
        case 'ageRangeMin':
            return 'age-range-min';
        case 'ageRangeMax':
            return 'age-range-max';
        case 'proofDocuments':
            return 'proof-required';
        default:
            throw new Error('Could not match the following error with an expected input.');
    }
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        console.log(req.body);
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
        }

        const cookies = new Cookies(req, res);
        const passengerTypeCookie = unescapeAndDecodeCookie(cookies, PASSENGER_TYPE_COOKIE);
        const fareTypeCookie = unescapeAndDecodeCookie(cookies, FARE_TYPE_COOKIE);
        let passengerType;
        if (passengerTypeCookie) {
            passengerType = JSON.parse(passengerTypeCookie).passengerType;
        }
        const { fareType } = JSON.parse(fareTypeCookie);

        if (!fareType) {
            throw new Error('Failed to retrieve the fareType cookie for the definePassengerType API');
        }
        if (!req.body) {
            throw new Error('Could not extract the relevant data from the request.');
        }

        const errors: ErrorInfo[] = [];

        const filteredReqBody = formatRequestBody(req);

        const groupPassengerTypes = getSessionAttribute(req, GROUP_PASSENGER_TYPES_ATTRIBUTE);

        const group = !!groupPassengerTypes;

        if (group && !req.body.maxNumber) {
            errors.push({
                errorMessage: groupSizeError,
                id: 'max-number-of-passengers',
            });
        }

        try {
            await passengerTypeDetailsSchema.validate(filteredReqBody, { abortEarly: false });
            if (req.body.minNumber) {
                minNumberGroupSizeSchema.validate(filteredReqBody);
            }
            if (req.body.maxNumber) {
                maxNumberGroupSizeSchema.validate(filteredReqBody);
            }
        } catch (validationErrors) {
            const validityErrors: yup.ValidationError = validationErrors;
            validityErrors.inner.forEach(error =>
                errors.push({
                    id: getErrorIdFromValidityError(error.path),
                    errorMessage: error.message,
                    userInput: error.value,
                }),
            );
        }

        if (req.body.minNumber && req.body.maxNumber && Number(req.body.maxNumber) < Number(req.body.minNumber)) {
            errors.push(
                {
                    errorMessage: 'Minimum number of passengers must be less than the maximum number.',
                    id: 'min-number-of-passengers',
                    userInput: req.body.minNumber,
                },
                {
                    errorMessage: 'Maximum number of passengers must be greater than the minumum number.',
                    id: 'max-number-of-passengers',
                    userInput: req.body.maxNumber,
                },
            );
        }

        if (errors.length === 0) {
            const passengerTypeCookieValue = JSON.stringify({ passengerType, ...filteredReqBody });
            setCookieOnResponseObject(PASSENGER_TYPE_COOKIE, passengerTypeCookieValue, req, res);
            redirectOnFareType(req, res);
            return;
        }
        const passengerTypeCookieValue = JSON.stringify({ errors, passengerType });
        setCookieOnResponseObject(PASSENGER_TYPE_COOKIE, passengerTypeCookieValue, req, res);
        if (group) {
            redirectTo(res, `/definePassengerType?groupPassengerType=${req.headers.referer?.split('=')[1]}`);
            return;
        }
        redirectTo(res, '/definePassengerType');
    } catch (error) {
        const message = 'There was a problem in the definePassengerType API.';
        redirectToError(res, message, 'api.definePassengerType', error);
    }
};
