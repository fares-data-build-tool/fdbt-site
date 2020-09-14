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

export const dateValidationSchema = yup.object({
    startDateDay: yup
        .number()
        .min(1)
        .max(31)
        .required(),
    startDateMonth: yup
        .number()
        .min(1)
        .max(12)
        .required(),
});

// 4digits

// is start date > end date then error

export const getErrorIdFromDateError = (errorPath: string): string => {
    switch (errorPath) {
        case 'startDateDay':
            return 'start-date';
        case 'startDateMonth':
            return 'start-date';
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
            console.log('validiotan errors', validationErrors);
            const validityErrors: yup.ValidationError = validationErrors;
            errors = validityErrors.inner.map(error => ({
                id: getErrorIdFromDateError(error.path),
                errorMessage: error.message,
                userInput: error.value,
            }));
        }

        console.log('yoyoyooy=', errors.length);
        // if (errors.length > 0) {
        updateSessionAttribute(req, PRODUCT_DATE_INFORMATION, { errors });
        redirectTo(res, '/productDateInformation');
        // }

        // const startDate = new Date().toLocaleDateString('en-GB', {
        //     day: 'numeric',
        //     month: 'short',
        //     year: 'numeric',
        // });

        // if (endDateDay === '' || endDateMonth === '' || endDateYear === '') {
        //     errors.push({ errorMessage: 'Fill in end dates', id: 'endDate' });
        // }

        //check if entry are numbers if all filled in
        // validate if empty one field empty
        //convert to date

        //redirectTo(res, '/fareDateInformation');
        return;
    } catch (error) {
        const message = 'There was a problem in the definePassengerType API.';
        redirectToError(res, message, 'api.definePassengerType', error);
    }
};
