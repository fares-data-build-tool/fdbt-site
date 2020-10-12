import { getMockRequestAndResponse } from '../../testData/mockData';
import searchOperators, {
    MultipleOperatorsAttributeWithErrors,
    removeListFromSelectedOperators,
    addListToSelectedOperators,
} from '../../../src/pages/api/searchOperators';
import * as session from '../../../src/utils/sessions';
import { MULTIPLE_OPERATOR_ATTRIBUTE } from '../../../src/constants';
import { Operator } from '../../../src/data/auroradb';

jest.mock('../../../src/utils/sessions.ts');

describe('searchOperators', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('removeListFromSelectedOperators', () => {
        it('should remove operators from the list of selected operators', () => {
            const mockOperatorToRemove = ['BLAC#Blackpool Transport'];
            const expectedUpdatedList: Operator[] = [
                { operatorPublicName: "Warrington's Own Buses", nocCode: 'WBTR' },
                { operatorPublicName: 'IW Bus Co', nocCode: 'IWBusCo' },
            ];
            const mockSelectedOperators: Operator[] = [
                ...expectedUpdatedList,
                { operatorPublicName: 'Blackpool Transport', nocCode: 'BLAC' },
            ];
            const updatedList = removeListFromSelectedOperators(mockOperatorToRemove, mockSelectedOperators);
            expect(updatedList).toEqual(expectedUpdatedList);
        });
    });

    describe('addListToSelectedOperators', () => {
        it('should add operators to the list of selected operators', () => {
            const mockOperatorsToAdd = ['BLAC#Blackpool Transport', "WBTR#Warrington's Own Buses"];
            const mockSelectedOperators: Operator[] = [
                { operatorPublicName: 'IW Bus Co', nocCode: 'IWBusCo' },
                { operatorPublicName: "Warrington's Own Buses", nocCode: 'WBTR' },
            ];
            const expectedUpdatedList: Operator[] = [
                { operatorPublicName: 'IW Bus Co', nocCode: 'IWBusCo' },
                { operatorPublicName: "Warrington's Own Buses", nocCode: 'WBTR' },
                { operatorPublicName: 'Blackpool Transport', nocCode: 'BLAC' },
            ];
            const updatedList = addListToSelectedOperators(mockOperatorsToAdd, mockSelectedOperators);
            expect(updatedList).toEqual(expectedUpdatedList);
        });
    });

    const updateSessionAttributeSpy = jest.spyOn(session, 'updateSessionAttribute');

    it('should error if the search text if entered is less than or equal to three characters', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                search: 'Search',
                searchText: 'ab',
            },
        });

        const expectedSessionAttributeCall: MultipleOperatorsAttributeWithErrors = {
            selectedOperators: [],
            errors: [
                {
                    errorMessage: 'Search requires a minimum of three characters',
                    id: 'search-input',
                },
            ],
        };

        searchOperators(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            MULTIPLE_OPERATOR_ATTRIBUTE,
            expectedSessionAttributeCall,
        );

        expect(res.writeHead).toBeCalledWith(302, {
            Location: '/searchOperators',
        });
    });

    it('should redirect with search text in the query and no errors', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                search: 'Search',
                searchText: 'manchester',
            },
        });

        searchOperators(req, res);

        expect(res.writeHead).toBeCalledWith(302, {
            Location: '/searchOperators?searchOperator=manchester',
        });
    });
});
