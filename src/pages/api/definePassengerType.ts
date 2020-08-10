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
import { GroupPassengerTypes } from './groupPassengerTypes';

const radioButtonError = 'Choose one of the options below';
const numberError = 'Enter a whole number between 0-150';
const ageRangeInputError = 'Enter a minimum or maximum age';
const proofSelectionError = 'Select at least one proof document';
const maxLessThanMinError = (inputType: string): string =>
    `Maximum ${inputType} cannot be less than minimum ${inputType}`;
const minGreaterThanMaxError = (inputType: string): string =>
    `Minimum ${inputType} cannot be greater than maximum ${inputType}`;

const wholeNumberSchema = yup
    .number()
    .typeError(numberError)
    .integer(numberError);
const maxNumberInputSchema = wholeNumberSchema.max(150, numberError);
const minNumberInputSchema = wholeNumberSchema.min(0, numberError);

export const passengerTypeDetailsSchema = yup
    .object({
        minNumber: yup.number().when('groupPassengerType', {
            is: groupPassengerTypeValue => !!groupPassengerTypeValue,
            then: yup
                .number()
                .when('maxNumber', {
                    is: maxNumberValue => !!maxNumberValue,
                    then: minNumberInputSchema
                        .max(yup.ref('maxNumber'), minGreaterThanMaxError('number of passengers'))
                        .notRequired(),
                })
                .when('maxNumber', {
                    is: maxNumberValue => !maxNumberValue,
                    then: minNumberInputSchema.max(150, numberError).notRequired(),
                }),
        }),
        maxNumber: yup.number().when('groupPassengerType', {
            is: groupPassengerTypeValue => !!groupPassengerTypeValue,
            then: yup
                .number()
                .when('minNumber', {
                    is: minNumberValue => !!minNumberValue,
                    then: maxNumberInputSchema
                        .min(yup.ref('minNumber'), maxLessThanMinError('number of passengers'))
                        .required(numberError),
                })
                .when('minNumber', {
                    is: minNumberValue => !minNumberValue,
                    then: maxNumberInputSchema.min(0, numberError).required(numberError),
                }),
        }),
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
                    then: minNumberInputSchema.max(yup.ref('ageRangeMax'), minGreaterThanMaxError('age')).notRequired(),
                })
                .when('ageRangeMax', {
                    is: ageRangeMaxValue => !ageRangeMaxValue,
                    then: minNumberInputSchema.max(150, numberError).required(ageRangeInputError),
                }),
        }),
        ageRangeMax: yup.number().when('ageRange', {
            is: 'Yes',
            then: yup
                .number()
                .when('ageRangeMin', {
                    is: ageRangeMinValue => !!ageRangeMinValue,
                    then: maxNumberInputSchema.min(yup.ref('ageRangeMin'), maxLessThanMinError('age')).notRequired(),
                })
                .when('ageRangeMin', {
                    is: ageRangeMinValue => !ageRangeMinValue,
                    then: maxNumberInputSchema.min(0, numberError).required(ageRangeInputError),
                }),
        }),
        proofDocuments: yup.string().when('proof', { is: 'Yes', then: yup.string().required(proofSelectionError) }),
    })
    .required();

export const formatRequestBody = (req: NextApiRequestWithSession): {} => {
    const filteredReqBody: { [key: string]: string | string[] } = {};
    Object.entries(req.body).forEach(entry => {
        if (
            entry[0] === 'ageRangeMin' ||
            entry[0] === 'ageRangeMax' ||
            entry[0] === 'minNumber' ||
            entry[0] === 'maxNumber'
        ) {
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
        case 'minNumber':
            return 'min-number-of-passengers';
        case 'maxNumber':
            return 'max-number-of-passengers';
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

        let errors: ErrorInfo[] = [];

        const filteredReqBody = formatRequestBody(req);

        try {
            await passengerTypeDetailsSchema.validate(filteredReqBody, { abortEarly: false });
        } catch (validationErrors) {
            const validityErrors: yup.ValidationError = validationErrors;
            errors = validityErrors.inner.map(error => ({
                id: getErrorIdFromValidityError(error.path),
                errorMessage: error.message,
                userInput: error.value,
            }));
        }

        const { groupPassengerType } = req.body;

        if (errors.length === 0) {
            let passengerTypeCookieValue = '';

            if (!group) {
                passengerTypeCookieValue = JSON.stringify({ passengerType, ...filteredReqBody });
                setCookieOnResponseObject(PASSENGER_TYPE_COOKIE, passengerTypeCookieValue, req, res);
            } else {
                passengerTypeCookieValue = JSON.stringify({ errors: [], passengerType });
                setCookieOnResponseObject(PASSENGER_TYPE_COOKIE, passengerTypeCookieValue, req, res);
                const selectedPassengerTypes = getSessionAttribute(req, GROUP_PASSENGER_TYPES_ATTRIBUTE);
                const submittedPassengerType = groupPassengerType;

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
            redirectTo(res, `/definePassengerType?groupPassengerType=${groupPassengerType}`);
            return;
        }
        redirectTo(res, '/definePassengerType');
    } catch (error) {
        const message = 'There was a problem in the definePassengerType API.';
        redirectToError(res, message, 'api.definePassengerType', error);
    }
};
