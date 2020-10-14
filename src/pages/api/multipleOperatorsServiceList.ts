import { NextApiResponse } from 'next';
import isArray from 'lodash/isArray';
import {
    COMPLETED_SERVICES_OPERATORS,
    MULTI_OPERATOR_SERVICES_ATTRIBUTE,
    SERVICE_LIST_ATTRIBUTE,
} from '../../constants/index';
import { isMultiOperatorInfoWithErrors } from '../../interfaces/typeGuards';
import { redirectTo, redirectToError } from './apiUtils';
import { isSessionValid } from './apiUtils/validator';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import { NextApiRequestWithSession, ErrorInfo, MultiOperatorInfo } from '../../interfaces';

const errorId = 'checkbox-0';

export interface MultiOperatorInfoWithErrors {
    errors: ErrorInfo[];
}

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    const redirectUrl = '/multipleOperatorsServiceList';
    const selectAllText = 'Select All Services';

    try {
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
        }

        const refererUrl = req?.headers?.referer;
        const queryString = refererUrl?.substring(refererUrl?.indexOf('?') + 1);
        const { selectAll } = req.body;

        const isSelected = selectAll === selectAllText;

        if (selectAll && queryString) {
            redirectTo(res, `${redirectUrl}?selectAll=${isSelected}`);
            return;
        }

        if ((!req.body || Object.keys(req.body).length === 0) && !selectAll) {
            updateSessionAttribute(req, SERVICE_LIST_ATTRIBUTE, {
                errors: [{ id: errorId, errorMessage: 'Choose at least one service from the options' }],
            });
            redirectTo(res, `${redirectUrl}?selectAll=false`);
            return;
        }

        const selectedServices: string[] = [];

        const requestBody: { [key: string]: string | string[] } = req.body;

        Object.entries(requestBody).forEach(entry => {
            const lineNameServiceCodeStartDate = entry[0];
            const description = entry[1];
            let serviceDescription: string;
            if (isArray(description)) {
                [serviceDescription] = description;
            } else {
                serviceDescription = description;
            }
            const data = `${lineNameServiceCodeStartDate}#${serviceDescription}`;
            selectedServices.push(data);
        });

        const currentNocCode = 'BLAC';

        const multiOperatorInfo = getSessionAttribute(req, MULTI_OPERATOR_SERVICES_ATTRIBUTE) || [];

        if (!isMultiOperatorInfoWithErrors(multiOperatorInfo)) {
            const arrayToAdd: MultiOperatorInfo[] = [];
            arrayToAdd.concat(multiOperatorInfo);
            arrayToAdd.push({ nocCode: currentNocCode, services: selectedServices });
            updateSessionAttribute(req, MULTI_OPERATOR_SERVICES_ATTRIBUTE, [...multiOperatorInfo]);
            const arrayOfCompletedOperators: string[] = [];
            const previouslyCompletedOperators = getSessionAttribute(req, COMPLETED_SERVICES_OPERATORS);
            arrayOfCompletedOperators.concat(previouslyCompletedOperators || []);
            arrayOfCompletedOperators.push(currentNocCode);
            updateSessionAttribute(req, COMPLETED_SERVICES_OPERATORS, arrayOfCompletedOperators);
            if (arrayOfCompletedOperators.length !== 7) {
                redirectTo(res, '/multipleOperatorsServiceList');
                return;
            }
        }

        redirectTo(res, '/howManyProducts');
        return;
    } catch (error) {
        const message = 'There was a problem processing the selected services from the servicesList page:';
        redirectToError(res, message, 'api.serviceList', error);
    }
};
