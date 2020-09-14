import { NextApiResponse } from 'next';
import { updateSessionAttribute } from '../../utils/sessions';
import { PRODUCT_DATE_INFORMATION } from '../../constants';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { redirectTo, redirectToError } from './apiUtils';
import * as yup from 'yup';

export interface ProductDatesAttribute {
    startDate: string;
    endDate: string;
}

export interface ProductDatesAttributeWithErrors {
    errors: ErrorInfo[];
}

const yearRegex = new RegExp('^[0-9][0-9][0-9][0-9]$');

export const dateValidationSchema = yup.object({
    startDateDay: yup
        .string()
        .min(1)
        .max(31)
        .required('Start Day is required'),
    startDateMonth: yup
        .string()
        .min(1)
        .max(12)
        .required('Start Month is required'),
    startDateYear: yup
        .string()
        .matches(yearRegex, 'Year is not valid')
        .required('Start Year is required'),
    endDateDay: yup
        .string()
        .min(1)
        .max(31)
        .required('End Day is required'),
    endDateMonth: yup
        .string()
        .min(1)
        .max(12)
        .required('End Month is required'),
    endDateYear: yup
        .string()
        .matches(yearRegex, 'Year is not valid')
        .required('End Year is required'),
});


// is start date > end date then error

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
        default:
            throw new Error(`Could not match the following error with an expected input. Error path: ${errorPath}.`);
    }
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        let errors: ErrorInfo[] = [];

        // if at least one field filled then need to validate
        // whether invalid characters
        // if date entered is correct after adding each element to new date and parsing it

        console.log('req===', req.body);
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

        updateSessionAttribute(req, PRODUCT_DATE_INFORMATION, { errors });
        redirectTo(res, '/productDateInformation');

        //check if entry are numbers if all filled in
        // validate if empty one field empty
        //convert to date

        //redirectTo(res, '/fareDateInformation');
        return;
    } catch (error) {
        const message = 'There was a problem in the productDateInformation API.';
        redirectToError(res, message, 'api.productDateInformation', error);
    }
};
