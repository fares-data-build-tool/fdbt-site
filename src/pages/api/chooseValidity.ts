import { NextApiResponse } from 'next';
import { DAYS_VALID_ATTRIBUTE } from '../../constants/index';
import { getUuidFromCookie } from '../../utils';
import { redirectToError, redirectTo, setCookieOnResponseObject } from './apiUtils';
import { isSessionValid } from './service/validator';
import { NextRequestWithSession } from '../../interfaces';

export const isInvalidValidityNumber = (req: NextRequestWithSession): boolean => {
    const { validityInput } = req.body;

    if (Number.isNaN(validityInput)) {
        return true;
    }

    if (!Number.isInteger(Number(validityInput))) {
        return true;
    }

    if (validityInput > 366 || validityInput < 1) {
        return true;
    }

    return false;
};

export const setCookie = (req: NextRequestWithSession, res: NextApiResponse, error = ''): void => {
    if (error === '') {
        const daysValid = req.body.validityInput;

        const uuid = getUuidFromCookie(req, res);
        const cookieValue = JSON.stringify({ daysValid, uuid });
        setCookieOnResponseObject(req, res, DAYS_VALID_ATTRIBUTE, cookieValue);
        return;
    }

    const daysValid = req.body.validityInput;
    const cookieValue = JSON.stringify({ daysValid, error });
    setCookieOnResponseObject(req, res, DAYS_VALID_ATTRIBUTE, cookieValue);
};

export default (req: NextRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (req.body.validityInput === '0') {
            setCookie(req, res, 'The value of days your product is valid for cannot be 0.');
            console.warn('0 entered as value for days your product is valid for.');
            redirectTo(res, '/chooseValidity');
            return;
        }

        if (!req.body.validityInput) {
            setCookie(req, res, 'The value of days your product is valid for cannot be empty.');
            console.warn('Nothing entered as value for days your product is valid for.');
            redirectTo(res, '/chooseValidity');
            return;
        }

        if (isInvalidValidityNumber(req)) {
            setCookie(
                req,
                res,
                'The value of days your product is valid for has to be a whole number between 1 and 366.',
            );
            console.warn('Invalid number entered as value for days your product is valid for.');
            redirectTo(res, '/chooseValidity');
            return;
        }

        setCookie(req, res);
        redirectTo(res, '/periodValidity');
    } catch (error) {
        const message = 'There was a problem inputting the number of days the product is valid for:';
        redirectToError(res, message, error);
    }
};
