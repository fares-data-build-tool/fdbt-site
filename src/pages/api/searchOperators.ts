import { NextApiResponse } from 'next';
import uniqBy from 'lodash/uniqBy';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { MULTIPLE_OPERATOR_ATTRIBUTE } from '../../constants';
import { redirectTo, redirectToError } from './apiUtils';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import { removeExcessWhiteSpace } from './apiUtils/validator';
import { Operator } from '../../data/auroradb';
import { addOperatorsErrorId, removeOperatorsErrorId, searchInputId } from '../searchOperators';

export interface MultipleOperatorsAttribute {
    selectedOperators: Operator[];
}

export interface MultipleOperatorsAttributeWithErrors extends MultipleOperatorsAttribute {
    errors: ErrorInfo[];
}

export const removeListFromSelectedOperators = (rawList: string[], selectedOperators: Operator[]): Operator[] => {
    const listToRemove = new Set(rawList.map(item => item.split('#')[0]));
    const updatedList = selectedOperators.filter(operator => !listToRemove.has(operator.nocCode));
    return updatedList;
};

export const addListToSelectedOperators = (rawList: string[], selectedOperators: Operator[]): Operator[] => {
    const formattedRawList = rawList.map(item => ({
        nocCode: item.split('#')[0],
        operatorPublicName: item.split('#')[1],
    }));
    const combinedLists = selectedOperators.concat(formattedRawList);
    const updatedList = uniqBy(combinedLists, 'nocCode');
    return updatedList;
};

export const isSearchInputValid = (searchText: string): boolean => {
    const searchRegex = new RegExp(/^[a-zA-Z0-9\-:\s]+$/g);
    return searchRegex.test(searchText);
};

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        const errors: ErrorInfo[] = [];
        const {
            search,
            searchText,
            addOperators,
            operatorsToAdd,
            removeOperators,
            operatorsToRemove,
            continueButtonClick,
        } = req.body;

        const multiOpAttribute = getSessionAttribute(req, MULTIPLE_OPERATOR_ATTRIBUTE);
        let selectedOperators = multiOpAttribute ? multiOpAttribute.selectedOperators : [];

        if (removeOperators) {
            if (!operatorsToRemove) {
                errors.push({
                    errorMessage: 'Select at least one operator to remove',
                    id: removeOperatorsErrorId,
                });
            } else {
                const rawList: string[] =
                    typeof operatorsToRemove === 'string' ? [operatorsToRemove] : operatorsToRemove;
                selectedOperators = removeListFromSelectedOperators(rawList, selectedOperators);
            }
        } else if (addOperators) {
            if (!operatorsToAdd) {
                const previousSearch = req.headers.referer?.split('?searchOperator=')[1] || '';
                errors.push({ errorMessage: 'Select at least one operator to add', id: addOperatorsErrorId });
                updateSessionAttribute(req, MULTIPLE_OPERATOR_ATTRIBUTE, { selectedOperators, errors });
                redirectTo(res, `/searchOperators?searchOperator=${previousSearch}`);
                return;
            }
            const rawList: string[] = typeof operatorsToAdd === 'string' ? [operatorsToAdd] : operatorsToAdd;
            selectedOperators = addListToSelectedOperators(rawList, selectedOperators);
        } else if (search) {
            const refinedSearch = removeExcessWhiteSpace(searchText);
            if (refinedSearch.length < 3) {
                errors.push({
                    errorMessage: 'Search requires a minimum of three characters',
                    id: searchInputId,
                });
            } else if (!isSearchInputValid(refinedSearch)) {
                errors.push({
                    errorMessage: 'Search must only include alphanumeric characters, hyphens or colons',
                    id: searchInputId,
                });
            } else {
                redirectTo(res, `/searchOperators?searchOperator=${refinedSearch}`);
                return;
            }
        }

        if (continueButtonClick) {
            if (operatorsToRemove) {
                errors.push({
                    errorMessage: "Click the 'Remove Operator(s)' button to remove operators",
                    id: removeOperatorsErrorId,
                });
            }
            if (operatorsToAdd) {
                const previousSearch = req.headers.referer?.split('?searchOperator=')[1] || '';
                errors.push({
                    errorMessage: "Click the 'Add Operator(s)' button to add operators",
                    id: addOperatorsErrorId,
                });
                updateSessionAttribute(req, MULTIPLE_OPERATOR_ATTRIBUTE, { selectedOperators, errors });
                redirectTo(res, `/searchOperators?searchOperator=${previousSearch}`);
                return;
            }
        }

        if (errors.length > 0) {
            updateSessionAttribute(req, MULTIPLE_OPERATOR_ATTRIBUTE, { selectedOperators, errors });
            redirectTo(res, '/searchOperators');
            return;
        }

        updateSessionAttribute(req, MULTIPLE_OPERATOR_ATTRIBUTE, { selectedOperators });

        if (continueButtonClick) {
            redirectTo(res, '/nextPage');
            return;
        }

        redirectTo(res, '/searchOperators');
    } catch (err) {
        const message = 'There was a problem in the search operators api.';
        redirectToError(res, message, 'api.searchOperators', err);
    }
};
