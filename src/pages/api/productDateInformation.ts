import { NextApiResponse } from 'next';
import * as yup from 'yup';
import { updateSessionAttribute } from '../../utils/sessions';
import { PRODUCT_DATE_INFORMATION } from '../../constants';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { redirectTo, redirectToError } from './apiUtils';
import moment from 'moment';

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

const errorMessage = (input: string) => `Enter your ${input} date must be in the following format`;
const startErrorMessage = errorMessage('Start');
const endErrorMessage = errorMessage('End');

// export const dateValidationSchemaStartEnd = yup.object().shape({
//     startDateDay: yup
//         .string()
//         .when('startDateMonth').is(value => value !== '')
//         .min(1, startErrorMessage)
//         .max(31, startErrorMessage),
//     startDateMonth: yup
//         .string()
//         .min(1, startErrorMessage)
//         .max(31, startErrorMessage),
// })

export const dateValidationSchema = yup.object({
    startDateDay: yup.string().notRequired(),
    startDateMonth: yup.string().notRequired(),
    startDateYear: yup.string().notRequired(),
    endDateDay: yup.string().notRequired(),
    endDateMonth: yup.string().notRequired(),
    endDateYear: yup.string().notRequired(),
});

export const combinedDateSchema = yup.object({
    startDate: yup.date().min(new Date(1900, 1, 1)),
    endDate: yup.date().min(yup.ref('startDate'), 'End date cannot be before the start date'),
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

        // try {
        //     await dateValidationSchema.validate(req.body, { abortEarly: false });
        // } catch (validationErrors) {
        //     const validityErrors: yup.ValidationError = validationErrors;
        //     console.log('datwvalidtiona', validationErrors);
        //     errors = validityErrors.inner.map(error => ({
        //         id: getErrorIdFromDateError(error.path),
        //         errorMessage: error.message,
        //         userInput: error.value,
        //     }));
        // }

        // require this as need the top validation to work first otherwise the messages are not consistent
        if (errors.length === 0) {
            const startDate = moment([startDateYear, startDateMonth - 1, startDateDay]);
            const endDate = moment([endDateYear, endDateMonth - 1, endDateDay, '23', '59']);

            const startDateValid = startDate.isValid();
            const endDateValid = endDate.isValid();

            if (!startDateValid) {
                errors.push({ errorMessage: 'Start date must be a real date', id: 'start-date' });
            }

            if (!endDateValid) {
                errors.push({ errorMessage: 'End date must be a real date', id: 'end-date' });
            }

            if (errors.length > 0) {
                updateSessionAttribute(req, PRODUCT_DATE_INFORMATION, { errors, dates: dateInput });
                redirectTo(res, '/productDateInformation');
                return;
            }

            try {
                console.log('start end', startDate, endDate);
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
