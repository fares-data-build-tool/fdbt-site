import { NextApiResponse } from 'next';
import Cookies from 'cookies';
import * as yup from 'yup';
import isArray from 'lodash/isArray';
import {
    redirectToError,
    redirectTo,
    unescapeAndDecodeCookie,
    redirectOnFareType,
    setCookieOnResponseObject,
} from './apiUtils/index';
import {
    FARE_TYPE_COOKIE,
    GROUP_PASSENGER_INFO_ATTRIBUTE,
    GROUP_PASSENGER_TYPES_ATTRIBUTE,
    PASSENGER_TYPE_COOKIE,
} from '../../constants/index';
import { isSessionValid } from './apiUtils/validator';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import { GroupPassengerTypes } from './defineGroupPassengers';

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
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
        }

        const cookies = new Cookies(req, res);
        const passengerTypeCookie = unescapeAndDecodeCookie(cookies, PASSENGER_TYPE_COOKIE);
        const fareTypeCookie = unescapeAndDecodeCookie(cookies, FARE_TYPE_COOKIE);

        let passengerType = '';

        const groupPassengerTypes = getSessionAttribute(req, GROUP_PASSENGER_TYPES_ATTRIBUTE);
        const group = !!groupPassengerTypes;

        if (!group) {
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

        const { groupPassengerTypeName } = req.body;

        if (errors.length === 0) {
            let passengerTypeCookieValue = '';

            if (!group) {
                passengerTypeCookieValue = JSON.stringify({ passengerType, ...filteredReqBody });
                setCookieOnResponseObject(PASSENGER_TYPE_COOKIE, passengerTypeCookieValue, req, res);
            } else {
                passengerTypeCookieValue = JSON.stringify({ errors: [], passengerType });
                setCookieOnResponseObject(PASSENGER_TYPE_COOKIE, passengerTypeCookieValue, req, res);
                const selectedPassengerTypes = getSessionAttribute(req, GROUP_PASSENGER_TYPES_ATTRIBUTE);
                const submittedPassengerType = groupPassengerTypeName;

                if (selectedPassengerTypes) {
                    const index = (selectedPassengerTypes as GroupPassengerTypes).passengerTypes.findIndex(
                        type => type === submittedPassengerType,
                    );

                    (selectedPassengerTypes as GroupPassengerTypes).passengerTypes.splice(index, 1);

                    const { minNumber, maxNumber, ageRangeMin, ageRangeMax, ageRange, proof } = req.body;

                    updateSessionAttribute(req, GROUP_PASSENGER_INFO_ATTRIBUTE, {
                        minNumber,
                        maxNumber,
                        minAge: ageRangeMin,
                        maxAge: ageRangeMax,
                        ageRange,
                        proofDocuments: proof,
                        passengerType: submittedPassengerType,
                        proof,
                    });

                    if ((selectedPassengerTypes as GroupPassengerTypes).passengerTypes.length > 0) {
                        redirectTo(
                            res,
                            `/definePassengerType?groupPassengerType=${
                                (selectedPassengerTypes as GroupPassengerTypes).passengerTypes[0]
                            }`,
                        );
                    } else {
                        redirectOnFareType(req, res);
                    }
                    return;
                }
            }

            redirectOnFareType(req, res);
            return;
        }
        const passengerTypeCookieValue = JSON.stringify({ errors, passengerType });
        setCookieOnResponseObject(PASSENGER_TYPE_COOKIE, passengerTypeCookieValue, req, res);
        if (group) {
            redirectTo(res, `/definePassengerType?groupPassengerType=${groupPassengerTypeName}`);
            return;
        }
        redirectTo(res, '/definePassengerType');
    } catch (error) {
        const message = 'There was a problem in the definePassengerType API.';
        redirectToError(res, message, 'api.definePassengerType', error);
    }
};
