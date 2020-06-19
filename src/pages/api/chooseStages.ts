import { NextApiRequest, NextApiResponse } from 'next';
import { FARE_STAGES_COOKIE } from '../../constants/index';
import { getDomain, setCookieOnResponseObject, redirectToError, redirectTo } from './apiUtils';
import { isSessionValid } from './service/validator';
import { ChooseStagesInputCheck } from '../chooseStages';

export const isInvalidFareStageNumber = (req: NextApiRequest): ChooseStagesInputCheck => {
    const { fareStageInput = '' } = req.body;
    const inputAsNumber = Number(fareStageInput);
    let error;

    if (fareStageInput === '' || Number.isNaN(inputAsNumber)) {
        error = 'Enter a whole number between 1 and 20';
    } else if (!Number.isInteger(inputAsNumber) || inputAsNumber > 10 || inputAsNumber < 1) {
        error = 'Enter a whole number between 1 and 20';
    } else {
        error = '';
    }
    const inputCheck = { fareStageInput, error };
    return inputCheck;
};

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const userInputValidity = isInvalidFareStageNumber(req);
        if (userInputValidity.error !== '') {
            const fareStageInputCookieValue = JSON.stringify(userInputValidity);
            setCookieOnResponseObject(getDomain(req), FARE_STAGES_COOKIE, fareStageInputCookieValue, req, res);
            redirectTo(res, '/chooseStages');
            return;
        }

        const numberOfFareStages = req.body.fareStageInput;
        const cookieValue = JSON.stringify({ fareStages: numberOfFareStages });
        setCookieOnResponseObject(getDomain(req), FARE_STAGES_COOKIE, cookieValue, req, res);
        redirectTo(res, '/stageNames');
    } catch (error) {
        const message = 'There was a problem inputting the number of fare stages:';
        redirectToError(res, message, error);
    }
};
