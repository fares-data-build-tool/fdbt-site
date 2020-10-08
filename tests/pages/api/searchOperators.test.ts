import { getMockRequestAndResponse } from '../../testData/mockData';
import searchOperators, { SearchOperators } from '../../../src/pages/api/searchOperators';
import * as session from '../../../src/utils/sessions';
import { SEARCH_OPERATOR_ATTRIBUTE } from '../../../src/constants';

jest.mock('../../../src/utils/sessions.ts');

describe('searchOperators', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    const updateSessionAttributeSpy = jest.spyOn(session, 'updateSessionAttribute');

    it('should error if the search text if entered is less than or equal to three characters', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                searchText: 'ab',
            },
        });

        const expectedSessionAttributeCall: SearchOperators = {
            errors: [
                {
                    errorMessage: 'Search requires a minimum of three characters',
                    id: 'searchText',
                },
            ],
            selectedOperators: [],
        };

        searchOperators(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            SEARCH_OPERATOR_ATTRIBUTE,
            expectedSessionAttributeCall,
        );

        expect(res.writeHead).toBeCalledWith(302, {
            Location: '/searchOperators',
        });
    });

    it('should redirect with search text in the query and no errors', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                searchText: 'manchester',
            },
        });

        searchOperators(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, SEARCH_OPERATOR_ATTRIBUTE, {
            errors: [],
            selectedOperators: [],
        });

        expect(res.writeHead).toBeCalledWith(302, {
            Location: '/searchOperators?searchOperator=manchester',
        });
    });
});
