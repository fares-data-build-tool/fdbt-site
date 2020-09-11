import { NextApiResponse } from 'next';
import { updateSessionAttribute } from '../../utils/sessions';
import { PRODUCT_DATE_INFORMATION } from '../../constants';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { redirectTo } from './apiUtils';

export interface ProductDatesAttribute {
    startDate: string;
    endDate: string;
}

export interface ProductDatesAttributeWithErrors {
    errors: ErrorInfo[];
}

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        const { startDateDay, startDateMonth, startDateYear, endDateDay, endDateMonth, endDateYear } = req.body;
        const errors: ErrorInfo[] = [];

        // if all empty then ignore
        // if at least one field filled then need to validate
        // whether invalid characters

        if (startDateDay === '' || startDateMonth === '' || startDateYear === '') {
            errors.push({ errorMessage: 'Fill in start dates', id: 'startDate' });
        }

        // const startDate = new Date().toLocaleDateString('en-GB', {
        //     day: 'numeric',
        //     month: 'short',
        //     year: 'numeric',
        // });

        // if (endDateDay === '' || endDateMonth === '' || endDateYear === '') {
        //     errors.push({ errorMessage: 'Fill in end dates', id: 'endDate' });
        // }

        if (errors.length > 0) {
            updateSessionAttribute(req, PRODUCT_DATE_INFORMATION, { errors });
            redirectTo(res, '/productDateInformation');
        }
        //check if entry are numbers if all filled in
        // validate if empty one field empty
        //convert to date

        //redirectTo(res, '/fareDateInformation');
        return;
    } catch (e) {
        console.log('e', e);
    }
};
