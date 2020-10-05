import { NextApiResponse } from 'next';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { SEARCH_OPERATOR_ATTRIBUTE } from '../../constants';
import { redirectTo, redirectToError } from './apiUtils';
import { updateSessionAttribute } from '../../utils/sessions';

export interface SearchOperatorsWithErrors {
    errors: ErrorInfo[];
}

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    const errors: ErrorInfo[] = [];

    try {
        const { searchText } = req.body;

        if (searchText.length < 3) {
            errors.push({
                errorMessage: 'Search requires a minimum of three characters',
                id: 'searchText',
            });
            updateSessionAttribute(req, SEARCH_OPERATOR_ATTRIBUTE, { errors });
            redirectTo(res, '/searchOperators');
        }

        updateSessionAttribute(req, SEARCH_OPERATOR_ATTRIBUTE, { errors: [] });
        redirectTo(res, `/searchOperators?searchOperator=${searchText}`);
    } catch (err) {
        const message = 'There was a problem in the search operators api.';
        redirectToError(res, message, 'api.searchOperators', err);
    }
};
