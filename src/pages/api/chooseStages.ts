import { NextApiResponse } from 'next';
import { FARE_STAGES_ATTRIBUTE } from '../../constants/index';
import { redirectTo, redirectToError } from './apiUtils';
import { isSessionValid } from './apiUtils/validator';
import { updateSessionAttribute } from '../../utils/sessions';
import { ErrorInfo, NextApiRequestWithSession, WithErrors } from '../../interfaces';

export const isInvalidFareStageNumber = (fareStageInput: string): WithErrors<{}> => {
    const inputAsNumber = Number(fareStageInput);
    const errors: ErrorInfo[] = [];

    if (
        fareStageInput === '' ||
        Number.isNaN(inputAsNumber) ||
        !Number.isInteger(inputAsNumber) ||
        inputAsNumber > 20 ||
        inputAsNumber < 2
    ) {
        errors.push({ errorMessage: 'Enter a whole number between 2 and 20', id: 'how-many-stages-error' });
    }

    return { errors };
};

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
        }

        const { fareStageInput = '' } = req.body;
        const userInputValidity = isInvalidFareStageNumber(fareStageInput);
        if (userInputValidity.errors.length > 0) {
            updateSessionAttribute(req, FARE_STAGES_ATTRIBUTE, {
                errors: userInputValidity.errors,
                fareStages: fareStageInput,
            });
            redirectTo(res, '/chooseStages');

            return;
        }

        updateSessionAttribute(req, FARE_STAGES_ATTRIBUTE, { fareStages: fareStageInput });
        redirectTo(res, '/stageNames');
    } catch (error) {
        const message = 'there was a problem inputting the number of fare stages:';
        redirectToError(res, message, 'api.chooseStages', error);
    }
};
