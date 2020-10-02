import { NextApiResponse } from 'next';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { SEARCH_OPERATOR_ATTRIBUTE } from '../../constants';
import { redirectTo, redirectToError } from './apiUtils';
import { updateSessionAttribute } from '../../utils/sessions';

export interface SearchOperators {
    searchResults: string[];
}

export interface SearchOperatorsWithErrors extends SearchOperators {
    errors: ErrorInfo[];
}

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    const errors: ErrorInfo[] = [];

    try {
        const { searchText } = req.body;

        if (searchText.length < 4) {
            errors.push({
                errorMessage: 'Search requires a minimum of three characters',
                id: 'searchText',
            });
        }

        if (errors.length > 0) {
            updateSessionAttribute(req, SEARCH_OPERATOR_ATTRIBUTE, { errors, searchResults: [] });
            redirectTo(res, '/searchOperators');
        }

        updateSessionAttribute(req, SEARCH_OPERATOR_ATTRIBUTE, { errors: [], searchResults: [] });
        redirectTo(res, `/searchOperators?searchOperator=${searchText}`);
    } catch (err) {
        const message = 'There was a problem in the search operators api.';
        redirectToError(res, message, 'api.searchOperators', err);
    }
};
