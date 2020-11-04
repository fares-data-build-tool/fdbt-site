import { NextApiResponse } from 'next';
import { NextApiRequestWithSession, ErrorInfo } from '../../interfaces/index';
import { updateSessionAttribute } from '../../utils/sessions';
import { TIME_PERIOD_VALID_ATTRIBUTE } from '../../constants/index';
import { redirectToError, redirectTo } from './apiUtils';
import { isSessionValid } from './apiUtils/validator';

export const isInvalidValidityNumber = (validityInput: number): boolean => {
    if (Number.isNaN(validityInput)) {
        return true;
    }

    if (!Number.isInteger(Number(validityInput))) {
        return true;
    }

    if (validityInput > 1000 || validityInput < 1) {
        return true;
    }

    return false;
};

export const validityInputErrorCheck = (errorInfo: ErrorInfo[], validityInput: string): ErrorInfo[] => {
    if (!validityInput) {
        errorInfo.push({
            errorMessage: 'The amount of time your product is valid for cannot be empty.',
            id: 'validity',
        });
        return errorInfo;
    }

    if (validityInput === '0') {
        errorInfo.push({
            errorMessage: 'The amount of time your product is valid for cannot be 0.',
            id: 'validity',
        });
        return errorInfo;
    }

    if (isInvalidValidityNumber(Number(validityInput))) {
        errorInfo.push({
            errorMessage:
                'The amount of time your your product is valid for has to be a whole number between 1 and 1000.',
            id: 'validity',
        });
        return errorInfo;
    }

    return errorInfo;
};

export const errorArrayCheckAndRedirect = (
    errorInfo: ErrorInfo[],
    validityInput: string,
    duration: string,
    req: NextApiRequestWithSession,
    res: NextApiResponse,
): void => {
    if (errorInfo.length > 0) {
        updateSessionAttribute(req, TIME_PERIOD_VALID_ATTRIBUTE, {
            amount: validityInput ?? '',
            timePeriodType: duration ?? '',
            errors: errorInfo,
        });
        redirectTo(res, '/chooseValidity');
    }
};

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
        }

        const { validityInput, duration } = req.body;
        const errorInfo: ErrorInfo[] = [];

        errorInfo.concat(validityInputErrorCheck(errorInfo, validityInput));

        if (!duration || duration !== ('day' || 'week' || 'month' || 'year')) {
            errorInfo.push({
                errorMessage: 'The type of duration is needed. Choose one of the options.',
                id: 'validity-units',
            });
        }
        errorArrayCheckAndRedirect(errorInfo, validityInput, duration, req, res);

        updateSessionAttribute(req, TIME_PERIOD_VALID_ATTRIBUTE, {
            amount: validityInput ?? '',
            timePeriodType: duration ?? '',
            errors: [],
        });
        redirectTo(res, '/periodValidity');
    } catch (error) {
        const message = 'There was a problem inputting the amount of time the product is valid for:';
        redirectToError(res, message, 'api.chooseValidity', error);
    }
};
