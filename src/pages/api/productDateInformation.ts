import { NextApiResponse } from 'next';
import { updateSessionAttribute } from '../../utils/sessions';
import { PRODUCT_DATE_INFORMATION } from '../../constants';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { redirectTo, redirectToError } from './apiUtils';
import * as yup from 'yup';

export interface ProductDateAttribute {
    startDate: string;
    endDate: string;
}

export interface ProductDatesAttributeWithErrors {
    errors: ErrorInfo[];
    dates: ProductDateInformationAttribute;
}

export interface ProductDateInformationAttribute {
    startDateDay: string;
    startDateMonth: string;
    startDateYear: string;
    endDateDay: string;
    endDateMonth: string;
    endDateYear: string;
}

const yearRegex = new RegExp('^[0-9][0-9][0-9][0-9]$');

const errorMessage = (input: string) => `${input} date must be in the following format`;
const startErrorMessage = errorMessage('Start');
const endErrorMessage = errorMessage('Start');

export const dateValidationSchema = yup.object({
    startDateDay: yup
        .string()
        .min(1, startErrorMessage)
        .max(31, startErrorMessage)
        .required(startErrorMessage),
    startDateMonth: yup
        .string()
        .min(1, startErrorMessage)
        .max(31, startErrorMessage)
        .required(startErrorMessage),
    startDateYear: yup
        .string()
        .matches(yearRegex, startErrorMessage)
        .required(startErrorMessage),
    endDateDay: yup
        .string()
        .min(1, endErrorMessage)
        .max(31, endErrorMessage)
        .required(endErrorMessage),
    endDateMonth: yup
        .string()
        .min(1, endErrorMessage)
        .max(12, endErrorMessage)
        .required(endErrorMessage),
    endDateYear: yup
        .string()
        .matches(yearRegex, endErrorMessage)
        .required(endErrorMessage),
});

export const combinedDateSchema = yup.object({
    startDate: yup.date(),
    endDate: yup.date().min(yup.ref('startDate'), 'end date cannot be before the start date'),
});

export const getErrorIdFromDateError = (errorPath: string): string => {
    switch (errorPath) {
        case 'startDateDay':
            return 'start-date';
        case 'startDateMonth':
            return 'start-date';
        case 'startDateYear':
            return 'start-date';
        case 'endDateDay':
            return 'end-date';
        case 'endDateMonth':
            return 'end-date';
        case 'endDateYear':
            return 'end-date';
        case 'startDate':
            return 'start-date';
        case 'endDate':
            return 'end-date';
        default:
            throw new Error(`Could not match the following error with an expected input. Error path: ${errorPath}.`);
    }
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        let errors: ErrorInfo[] = [];

        const { startDateDay, startDateMonth, startDateYear, endDateDay, endDateMonth, endDateYear } = req.body;

        const dateInput: ProductDateInformationAttribute = {
            startDateDay,
            startDateMonth,
            startDateYear,
            endDateDay,
            endDateMonth,
            endDateYear,
        };

        try {
            await dateValidationSchema.validate(req.body, { abortEarly: false });
        } catch (validationErrors) {
            const validityErrors: yup.ValidationError = validationErrors;
            errors = validityErrors.inner.map(error => ({
                id: getErrorIdFromDateError(error.path),
                errorMessage: error.message,
                userInput: error.value,
            }));
        }

        // require this as need the top validation to work first otherwise the messages are not consistent
        if (errors.length === 0) {
            const startDate = new Date(startDateYear, startDateMonth, startDateDay);
            const endDate = new Date(endDateYear, endDateMonth, endDateDay);

            try {
                await combinedDateSchema.validate({ startDate, endDate }, { abortEarly: false });
            } catch (validationErrors) {
                const validityErrors: yup.ValidationError = validationErrors;
                errors = validityErrors.inner.map(error => ({
                    id: getErrorIdFromDateError(error.path),
                    errorMessage: error.message,
                    userInput: error.value,
                }));
            }

            updateSessionAttribute(req, PRODUCT_DATE_INFORMATION, { errors, dates: dateInput });
            redirectTo(res, '/productDateInformation');
        }

        updateSessionAttribute(req, PRODUCT_DATE_INFORMATION, {
            errors,
            dates: dateInput,
        });
        redirectTo(res, '/productDateInformation');

        return;
    } catch (error) {
        const message = 'There was a problem in the productDateInformation API.';
        redirectToError(res, message, 'api.productDateInformation', error);
    }
};
