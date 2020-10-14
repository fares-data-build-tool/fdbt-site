import { getMockRequestAndResponse } from '../../testData/mockData';
import searchOperators, {
    MultipleOperatorsAttributeWithErrors,
    removeOperatorsFromPreviouslySelectedOperators,
    addOperatorsToPreviouslySelectedOperators,
    isSearchInputValid,
    MultipleOperatorsAttribute,
} from '../../../src/pages/api/searchOperators';
import * as session from '../../../src/utils/sessions';
import { MULTIPLE_OPERATOR_ATTRIBUTE } from '../../../src/constants';
import { Operator } from '../../../src/data/auroradb';

describe('searchOperators', () => {
    const updateSessionAttributeSpy = jest.spyOn(session, 'updateSessionAttribute');

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('removeOperatorsFromPreviouslySelectedOperators', () => {
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
            const updatedList = removeOperatorsFromPreviouslySelectedOperators(
                mockOperatorToRemove,
                mockSelectedOperators,
            );
            expect(updatedList).toEqual(expectedUpdatedList);
        });
    });

    describe('addOperatorsToPreviouslySelectedOperators', () => {
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
            const updatedList = addOperatorsToPreviouslySelectedOperators(mockOperatorsToAdd, mockSelectedOperators);
            expect(updatedList).toEqual(expectedUpdatedList);
        });
    });

    describe('isSearchInputValid', () => {
        it.each([
            [true, 'only valid', 'blackburn - bus'],
            [false, 'invalid', 'bl@ckpoo| tran$port'],
        ])('should return %s when a search term contains %s characters', (expectedValidity, _case, searchText) => {
            const actualValidity = isSearchInputValid(searchText);
            expect(actualValidity).toBe(expectedValidity);
        });
    });

    it('should redirect to itself (i.e. /searchOperators) with search text in the query string when the search term is valid', () => {
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

    it('should redirect to itself (i.e. /searchOperators) with search input errors when the user enters an invalid search term', () => {
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

    it("should succesfully add to the selected operators when the user selects from the search results and clicks the 'Add Opertator' button", () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                addOperators: 'Add Operator(s)',
                operatorsToAdd: "WBTR#Warrington's Own Buses",
                searchText: '',
            },
        });

        const expectedSessionAttributeCall: MultipleOperatorsAttribute = {
            selectedOperators: [
                {
                    nocCode: 'WBTR',
                    operatorPublicName: "Warrington's Own Buses",
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

    it("should redirect with errors when the user tries to add to the selected operators and clicks the 'Continue' button", () => {
        const { req, res } = getMockRequestAndResponse({
            requestHeaders: { referer: 'host/searchOperators?searchOperator=warr' },
            body: {
                continueButtonClick: 'Continue',
                operatorsToAdd: "WBTR#Warrington's Own Buses",
                searchText: '',
            },
            session: {
                [MULTIPLE_OPERATOR_ATTRIBUTE]: {
                    selectedOperators: [{ nocCode: 'MCTR', operatorPublicName: 'Manchester Community Transport' }],
                },
            },
        });

        const expectedSessionAttributeCall: MultipleOperatorsAttributeWithErrors = {
            selectedOperators: [{ nocCode: 'MCTR', operatorPublicName: 'Manchester Community Transport' }],
            errors: [
                { errorMessage: "Click the 'Add Operator(s)' button to add operators", id: 'add-operator-checkbox-0' },
            ],
        };

        searchOperators(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            MULTIPLE_OPERATOR_ATTRIBUTE,
            expectedSessionAttributeCall,
        );
        expect(res.writeHead).toBeCalledWith(302, {
            Location: '/searchOperators?searchOperator=warr',
        });
    });

    it("should redirect with errors when the user clicks the 'Add Operator' button without making a selection", () => {
        const { req, res } = getMockRequestAndResponse({
            requestHeaders: { referer: 'host/searchOperators?searchOperator=warr' },
            body: {
                addOperators: 'Add Operator(s)',
                searchText: '',
            },
        });

        const expectedSessionAttributeCall: MultipleOperatorsAttributeWithErrors = {
            selectedOperators: [],
            errors: [{ errorMessage: 'Select at least one operator to add', id: 'add-operator-checkbox-0' }],
        };

        searchOperators(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            MULTIPLE_OPERATOR_ATTRIBUTE,
            expectedSessionAttributeCall,
        );
        expect(res.writeHead).toBeCalledWith(302, {
            Location: '/searchOperators?searchOperator=warr',
        });
    });

    it("should succesfully remove from the selected operators when the user selects from the list and clicks the 'Remove Operator' button", () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                operatorsToRemove: ['MCTR#Manchester Community Transport', 'MCTR2#Manchester Community Transport 2'],
                removeOperators: 'Remove Operators',
                searchText: '',
            },
            session: {
                [MULTIPLE_OPERATOR_ATTRIBUTE]: {
                    selectedOperators: [
                        {
                            nocCode: 'MCTR',
                            operatorPublicName: 'Manchester Community Transport',
                        },
                        {
                            nocCode: 'MCTR2',
                            operatorPublicName: 'Manchester Community Transport 2',
                        },
                        {
                            nocCode: 'MCTR3',
                            operatorPublicName: 'Manchester Community Transport 3',
                        },
                    ],
                },
            },
        });

        const expectedSessionAttributeCall: MultipleOperatorsAttribute = {
            selectedOperators: [
                {
                    nocCode: 'MCTR3',
                    operatorPublicName: 'Manchester Community Transport 3',
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

    it("should redirect with errors when the user tries to remove selected operators and clicks the 'Continue' button", () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                continueButtonClick: 'Continue',
                operatorsToRemove: "WBTR#Warrington's Own Buses",
                searchText: '',
            },
            session: {
                [MULTIPLE_OPERATOR_ATTRIBUTE]: {
                    selectedOperators: [{ nocCode: 'WBTR', operatorPublicName: "Warrington's Own Buses" }],
                },
            },
        });

        const expectedSessionAttributeCall: MultipleOperatorsAttributeWithErrors = {
            selectedOperators: [{ nocCode: 'WBTR', operatorPublicName: "Warrington's Own Buses" }],
            errors: [
                {
                    errorMessage: "Click the 'Remove Operator(s)' button to remove operators",
                    id: 'remove-operator-checkbox-0',
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

    it("should redirect with errors when the user clicks the 'Remove Operator' button without making a selection", () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                removeOperators: 'Remove Operators',
                searchText: '',
            },
            session: {
                [MULTIPLE_OPERATOR_ATTRIBUTE]: {
                    selectedOperators: [{ nocCode: 'WBTR', operatorPublicName: "Warrington's Own Buses" }],
                },
            },
        });

        const expectedSessionAttributeCall: MultipleOperatorsAttributeWithErrors = {
            selectedOperators: [{ nocCode: 'WBTR', operatorPublicName: "Warrington's Own Buses" }],
            errors: [{ errorMessage: 'Select at least one operator to remove', id: 'remove-operator-checkbox-0' }],
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
});
