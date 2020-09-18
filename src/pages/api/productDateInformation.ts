import { NextApiResponse } from 'next';
import * as yup from 'yup';
import moment from 'moment';
import { updateSessionAttribute } from '../../utils/sessions';
import { PRODUCT_DATE_ATTRIBUTE } from '../../constants';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { redirectTo, redirectToError } from './apiUtils';

export interface ProductDate {
    startDate: string;
    endDate: string;
}

export interface ProductDatesWithErrors {
    errors: ErrorInfo[];
    dates: ProductDateInformation;
}

export interface ProductDateInformation {
    startDateDay: string;
    startDateMonth: string;
    startDateYear: string;
    endDateDay: string;
    endDateMonth: string;
    endDateYear: string;
}

export const dateValidationSchema = yup.object({
    startDateDay: yup.string().notRequired(),
    startDateMonth: yup.string().notRequired(),
    startDateYear: yup.string().notRequired(),
    endDateDay: yup.string().notRequired(),
    endDateMonth: yup.string().notRequired(),
    endDateYear: yup.string().notRequired(),
});

export const combinedDateSchema = yup.object({
    endDate: yup.date().min(yup.ref('startDate'), 'The end date must be after the start date'),
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

const isDatesFieldEmpty = (day: string, month: string, year: string): boolean =>
    day === '' && month === '' && year === '';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        let errors: ErrorInfo[] = [];

        const {
            startDateDay,
            startDateMonth,
            startDateYear,
            endDateDay,
            endDateMonth,
            endDateYear,
            productDates,
        } = req.body;

        const dateInput: ProductDateInformation = {
            startDateDay,
            startDateMonth,
            startDateYear,
            endDateDay,
            endDateMonth,
            endDateYear,
        };

        if (!productDates) {
            errors.push({ errorMessage: 'Choose one of the options below', id: 'product-dates-required' });
            updateSessionAttribute(req, PRODUCT_DATE_ATTRIBUTE, { errors, dates: dateInput });
            redirectTo(res, '/productDateInformation');
            return;
        }

        let startDate = moment();
        let endDate = moment().add(100, 'y');

        if (productDates === 'Yes') {
            const isStartDateEmpty = isDatesFieldEmpty(startDateDay, startDateMonth, startDateYear);
            const isEndDateEmpty = isDatesFieldEmpty(endDateDay, endDateMonth, endDateYear);

            if (isStartDateEmpty && isEndDateEmpty) {
                errors.push({ errorMessage: 'Enter a start or end date', id: 'start-date' });
            }

            if (!isStartDateEmpty) {
                startDate = moment([startDateYear, startDateMonth - 1, startDateDay, '00', '01']);
            }

            if (!isEndDateEmpty) {
                endDate = moment([endDateYear, endDateMonth - 1, endDateDay, '23', '59']);
            }

            if (!startDate.isValid() && !isStartDateEmpty) {
                errors.push({ errorMessage: 'Start date must be a real date', id: 'start-date' });
            }

            if (!endDate.isValid() && !isEndDateEmpty) {
                errors.push({ errorMessage: 'End date must be a real date', id: 'end-date' });
            }

            if (errors.length > 0) {
                updateSessionAttribute(req, PRODUCT_DATE_ATTRIBUTE, { errors, dates: dateInput });
                redirectTo(res, '/productDateInformation');
                return;
            }

            try {
                await combinedDateSchema.validate({ startDate, endDate }, { abortEarly: false });
            } catch (validationErrors) {
                const validityErrors: yup.ValidationError = validationErrors;
                errors = validityErrors.inner.map(error => ({
                    id: getErrorIdFromDateError(error.path),
                    errorMessage: error.message,
                    userInput: error.value,
                }));

                if (errors.length > 0) {
                    updateSessionAttribute(req, PRODUCT_DATE_ATTRIBUTE, {
                        errors,
                        dates: dateInput,
                    });
                    redirectTo(res, '/productDateInformation');
                    return;
                }
            }

            updateSessionAttribute(req, PRODUCT_DATE_ATTRIBUTE, {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            });

            redirectTo(res, '/confirmation');
            return;
        }

        updateSessionAttribute(req, PRODUCT_DATE_ATTRIBUTE, {
            startDate: moment().toISOString(),
            endDate: moment()
                .add(100, 'y')
                .toISOString(),
        });
        redirectTo(res, '/confirmation');
    } catch (error) {
        const message = 'There was a problem in the productDateInformation API.';
        redirectToError(res, message, 'api.productDateInformation', error);
    }
};
