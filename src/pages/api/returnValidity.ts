import { NextApiResponse } from 'next';
import * as yup from 'yup';
import { redirectToError, redirectTo } from './apiUtils/index';
import { isSessionValid } from './apiUtils/validator';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { updateSessionAttribute } from '../../utils/sessions';
import { RETURN_VALIDITY_ATTRIBUTE } from '../../constants';

const radioButtonError = 'Choose one of the options below';
const inputError = 'Enter a whole number';
const daysAmountError = 'Enter a number of days between 1 and 31';
const weeksAmountError = 'Enter a number of weeks between 1 and 52';
const monthsAmountError = 'Enter a number of months between 1 and 72';
const yearsAmountError = 'Enter a number of years greater than 1';
const selectError = 'Choose one of the options from the dropdown list';

export const returnValiditySchema = yup
    .object({
        validity: yup
            .string()
            .oneOf(['Yes', 'No'])
            .required(radioButtonError),
        amount: yup
            .mixed()
            .when('validity', {
                is: 'No',
                then: yup.string().notRequired(),
            })
            .when('validity', {
                is: 'Yes',
                then: yup
                    .number()
                    .typeError(inputError)
                    .when('duration', {
                        is: 'days',
                        then: yup
                            .number()
                            .typeError(inputError)
                            .integer(inputError)
                            .min(1, daysAmountError)
                            .max(31, daysAmountError),
                    })
                    .when('duration', {
                        is: 'weeks',
                        then: yup
                            .number()
                            .typeError(inputError)
                            .integer(inputError)
                            .min(1, weeksAmountError)
                            .max(52, weeksAmountError),
                    })
                    .when('duration', {
                        is: 'months',
                        then: yup
                            .number()
                            .typeError(inputError)
                            .integer(inputError)
                            .min(1, monthsAmountError)
                            .max(72, monthsAmountError),
                    })
                    .when('duration', {
                        is: 'years',
                        then: yup
                            .number()
                            .typeError(inputError)
                            .integer(inputError)
                            .min(1, yearsAmountError),
                    })
                    .required(inputError),
            }),
        duration: yup.string().when('validity', {
            is: 'Yes',
            then: yup
                .string()
                .oneOf(['days', 'weeks', 'months', 'years'], selectError)
                .required(selectError),
        }),
    })
    .required();

export const getErrorIdFromValidityError = (errorPath: string): string => {
    switch (errorPath) {
        case 'validity':
            return 'return-validity-defined';
        case 'amount':
            return 'return-validity-amount';
        case 'duration':
            return 'return-validity-units';
        default:
            throw new Error(`Could not match the following error with an expected input. Error path: ${errorPath}.`);
    }
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
        }

        const { amount, duration } = req.body;

        let errors: ErrorInfo[] = [];

        try {
            await returnValiditySchema.validate(req.body, { abortEarly: false });
        } catch (validationErrors) {
            const validityErrors: yup.ValidationError = validationErrors;
            errors = validityErrors.inner.map(error => ({
                id: getErrorIdFromValidityError(error.path),
                errorMessage: error.message,
                userInput: String(error.value),
            }));
        }

        if (errors.length > 0) {
            updateSessionAttribute(req, RETURN_VALIDITY_ATTRIBUTE, { errors });
            redirectTo(res, '/returnValidity');
            return;
        }

        updateSessionAttribute(req, RETURN_VALIDITY_ATTRIBUTE, { amount, duration });
        redirectTo(res, '/selectSalesOfferPackage');
    } catch (error) {
        const message = 'There was a problem in the returnValidity API.';
        redirectToError(res, message, 'api.returnValidity', error);
    }
};
