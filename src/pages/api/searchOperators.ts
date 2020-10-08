import { NextApiResponse } from 'next';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { SEARCH_OPERATOR_ATTRIBUTE } from '../../constants';
import { redirectTo, redirectToError } from './apiUtils';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import { removeExcessWhiteSpace } from './apiUtils/validator';
import { OperatorNameType } from '../../data/auroradb';

export interface SearchOperators {
    selectedOperators: OperatorNameType[];
    errors: ErrorInfo[];
}

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    const errors: ErrorInfo[] = [];

    const { addOperator } = req.body;
    const refererUrl = req?.headers?.referer;
    const queryString = refererUrl?.substring(refererUrl?.indexOf('?') + 1);

    const searchOperatorAttribute = getSessionAttribute(req, SEARCH_OPERATOR_ATTRIBUTE);

    if (addOperator) {
        const requestBody: { [key: string]: string | string[] } = req.body;

        if (Object.keys(req.body).length - 2 === 0) {
            errors.push({
                errorMessage: 'Choose at least one operator from the options',
                id: 'searchText',
            });

            updateSessionAttribute(req, SEARCH_OPERATOR_ATTRIBUTE, {
                errors,
                selectedOperators: searchOperatorAttribute?.selectedOperators || [],
            });
            redirectTo(res, `/searchOperators?${queryString}`);
        }

        const selectedOperators: OperatorNameType[] = [];

        const currentSelectedOperators = (searchOperatorAttribute && searchOperatorAttribute.selectedOperators) || [];

        Object.entries(requestBody).forEach(entry => {
            if (entry[0] === 'searchText' || entry[0] === 'addOperator') {
                return;
            }

            if (
                searchOperatorAttribute &&
                !searchOperatorAttribute.selectedOperators.some(
                    operator => operator.nocCode === removeExcessWhiteSpace(entry[1].toString()),
                )
            ) {
                selectedOperators.push({
                    operatorPublicName: entry[0].toString(),
                    nocCode: removeExcessWhiteSpace(entry[1].toString()),
                });
            }
        });

        const mergedArray = selectedOperators.concat(currentSelectedOperators);

        updateSessionAttribute(req, SEARCH_OPERATOR_ATTRIBUTE, {
            selectedOperators: mergedArray,
            errors,
        });

        redirectTo(res, `/searchOperators`);
    }

    try {
        const refinedSearch = removeExcessWhiteSpace(req.body.searchText);

        if (refinedSearch.length < 3) {
            errors.push({
                errorMessage: 'Search requires a minimum of three characters',
                id: 'searchText',
            });
            updateSessionAttribute(req, SEARCH_OPERATOR_ATTRIBUTE, {
                errors,
                selectedOperators: searchOperatorAttribute?.selectedOperators || [],
            });
            redirectTo(res, '/searchOperators');
        }
        // below session attribute arguably shouldnt be set, and if it is, doesnt need an empty array inside it.
        updateSessionAttribute(req, SEARCH_OPERATOR_ATTRIBUTE, {
            errors,
            selectedOperators: searchOperatorAttribute?.selectedOperators || [],
        });
        redirectTo(res, `/searchOperators?searchOperator=${refinedSearch}`);
    } catch (err) {
        const message = 'There was a problem in the search operators api.';
        redirectToError(res, message, 'api.searchOperators', err);
    }
};
