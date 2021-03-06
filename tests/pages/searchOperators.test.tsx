import * as React from 'react';
import { shallow } from 'enzyme';
import { getMockContext, mockSchemOpIdToken } from '../testData/mockData';
import * as aurora from '../../src/data/auroradb';
import SearchOperators, { getServerSideProps, SearchOperatorProps } from '../../src/pages/searchOperators';
import { MULTIPLE_OPERATOR_ATTRIBUTE, OPERATOR_ATTRIBUTE } from '../../src/constants/attributes';
import { ErrorInfo, Operator } from '../../src/interfaces';

describe('pages', () => {
    describe('searchOperator', () => {
        const mockOperators: Operator[] = [
            {
                name: "Warrington's Own Buses",
                nocCode: 'WBTR',
            },
            {
                name: 'Blackpool Transport',
                nocCode: 'BLAC',
            },
            {
                name: 'IW Bus Co',
                nocCode: 'IWBusCo',
            },
        ];

        afterEach(() => {
            jest.resetAllMocks();
        });

        it('should render just the search input when the user first visits the page', () => {
            const tree = shallow(
                <SearchOperators errors={[]} searchText="" searchResults={[]} selectedOperators={[]} csrfToken="" />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render the search input and search results when there is a successful search', () => {
            const tree = shallow(
                <SearchOperators
                    errors={[]}
                    searchText="blac"
                    searchResults={[{ nocCode: 'BLAC', name: 'Blackpool' }]}
                    selectedOperators={[]}
                    csrfToken=""
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render an input error when the user makes an unsucessful search', () => {
            const tree = shallow(
                <SearchOperators
                    errors={[{ errorMessage: 'Search requires a minimum of three characters', id: 'search-input' }]}
                    searchText=""
                    searchResults={[]}
                    selectedOperators={[]}
                    csrfToken=""
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render a selection error when the user tries to add operators without selecting any search results', () => {
            const tree = shallow(
                <SearchOperators
                    errors={[]}
                    searchText="blac"
                    searchResults={[{ nocCode: 'BLAC', name: 'Blackpool' }]}
                    selectedOperators={[]}
                    csrfToken=""
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render the search input and a list of selected operators when search results have been selected', () => {
            const tree = shallow(
                <SearchOperators
                    errors={[]}
                    searchText=""
                    searchResults={[]}
                    selectedOperators={mockOperators}
                    csrfToken=""
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render a selection error when the user tries to remove selected operators without making a selection', () => {
            const tree = shallow(
                <SearchOperators
                    errors={[]}
                    searchText=""
                    searchResults={[]}
                    selectedOperators={mockOperators}
                    csrfToken=""
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render the search input, search results and a list of selected operators when an additional search is made', () => {
            const tree = shallow(
                <SearchOperators
                    errors={[]}
                    searchText="warri"
                    searchResults={[mockOperators[0]]}
                    selectedOperators={mockOperators}
                    csrfToken=""
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        describe('getServerSideProps', () => {
            const getSearchOperatorsBySearchTextSpy = jest.spyOn(aurora, 'getSearchOperatorsBySearchText');

            it('should return base props when the page is first visited by the user', async () => {
                const mockProps: { props: SearchOperatorProps } = {
                    props: {
                        errors: [],
                        searchText: '',
                        searchResults: [],
                        selectedOperators: [],
                        csrfToken: '',
                    },
                };
                const ctx = getMockContext();
                const result = await getServerSideProps(ctx);

                expect(result).toEqual(mockProps);
            });

            it('should return base props with errors when the the MULTIPLE_OPERATOR_ATTRIBUTE contains errors', async () => {
                const mockErrors: ErrorInfo[] = [
                    {
                        errorMessage: 'Search requires a minimum of three characters',
                        id: 'search-input',
                    },
                ];
                const mockProps: { props: SearchOperatorProps } = {
                    props: {
                        errors: mockErrors,
                        searchText: '',
                        searchResults: [],
                        selectedOperators: [],
                        csrfToken: '',
                    },
                };
                const ctx = getMockContext({ session: { [MULTIPLE_OPERATOR_ATTRIBUTE]: { errors: mockErrors } } });
                const result = await getServerSideProps(ctx);

                expect(result).toEqual(mockProps);
            });

            it('should return base props with errors when the url query string contains an invalid search term', async () => {
                getSearchOperatorsBySearchTextSpy.mockImplementation().mockResolvedValue([]);
                const mockErrors: ErrorInfo[] = [
                    {
                        errorMessage: "No operators found for 'asda'. Try another search term.",
                        id: 'search-input',
                    },
                ];
                const mockProps: { props: SearchOperatorProps } = {
                    props: {
                        errors: mockErrors,
                        searchText: 'asda',
                        searchResults: [],
                        selectedOperators: [],
                        csrfToken: '',
                    },
                };
                const ctx = getMockContext({
                    session: { [MULTIPLE_OPERATOR_ATTRIBUTE]: undefined },
                    query: { searchOperator: 'asda' },
                });
                const result = await getServerSideProps(ctx);

                expect(result).toEqual(mockProps);
            });

            it('should return props containing search results when the url query string contains a valid search term and the user is not a scheme operator', async () => {
                getSearchOperatorsBySearchTextSpy.mockImplementation().mockResolvedValue(mockOperators);
                const mockProps: { props: SearchOperatorProps } = {
                    props: {
                        errors: [],
                        searchText: 'blac',
                        searchResults: mockOperators,
                        selectedOperators: [],
                        csrfToken: '',
                    },
                };
                const ctx = getMockContext({
                    session: { [MULTIPLE_OPERATOR_ATTRIBUTE]: undefined },
                    query: { searchOperator: 'blac' },
                });
                const result = await getServerSideProps(ctx);

                expect(getSearchOperatorsBySearchTextSpy).toHaveBeenCalled();
                expect(result).toEqual(mockProps);
            });

            it('should return props containing search results when the url query string contains a valid search term and the user is a scheme operator', async () => {
                getSearchOperatorsBySearchTextSpy.mockImplementation().mockResolvedValue(mockOperators);
                const mockProps: { props: SearchOperatorProps } = {
                    props: {
                        errors: [],
                        searchText: 'blac',
                        searchResults: mockOperators,
                        selectedOperators: [],
                        csrfToken: '',
                    },
                };
                const ctx = getMockContext({
                    session: {
                        [MULTIPLE_OPERATOR_ATTRIBUTE]: undefined,
                        [OPERATOR_ATTRIBUTE]: { name: 'SCHEME_OPERATOR', region: 'SCHEME_REGION' },
                    },
                    query: { searchOperator: 'blac' },
                    cookies: {
                        idToken: mockSchemOpIdToken,
                    },
                });
                const result = await getServerSideProps(ctx);

                expect(getSearchOperatorsBySearchTextSpy).toHaveBeenCalled();
                expect(result).toEqual(mockProps);
            });
        });
    });
});
