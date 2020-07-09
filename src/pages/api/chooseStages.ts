import { NextApiResponse } from 'next';
import { FARE_STAGES_COOKIE } from '../../constants/index';
import { redirectToError, redirectTo, setCookieOnResponseObject } from './apiUtils';
import { isSessionValid } from './service/validator';
import { ChooseStagesInputCheck } from '../chooseStages';
import { NextRequestWithSession } from '../../interfaces';

export const isInvalidFareStageNumber = (fareStageInput: string): ChooseStagesInputCheck => {
    const inputAsNumber = Number(fareStageInput);
    let error = '';

    if (
        fareStageInput === '' ||
        Number.isNaN(inputAsNumber) ||
        !Number.isInteger(inputAsNumber) ||
        inputAsNumber > 20 ||
        inputAsNumber < 2
    ) {
        error = 'Enter a whole number between 2 and 20';
    }
    const inputCheck = { fareStageInput, error };
    return inputCheck;
};

export default (req: NextRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const { fareStageInput = '' } = req.body;
        const userInputValidity = isInvalidFareStageNumber(fareStageInput);
        if (userInputValidity.error !== '') {
            const fareStageInputCookieValue = JSON.stringify(userInputValidity);
            setCookieOnResponseObject(req, res, FARE_STAGES_COOKIE, fareStageInputCookieValue);
            redirectTo(res, '/chooseStages');
            return;
        }

        const cookieValue = JSON.stringify({ fareStages: fareStageInput });
        setCookieOnResponseObject(req, res, FARE_STAGES_COOKIE, cookieValue);
        redirectTo(res, '/stageNames');
    } catch (error) {
        const message = 'There was a problem inputting the number of fare stages:';
        redirectToError(res, message, error);
    }
};
