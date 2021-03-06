import * as React from 'react';
import { shallow } from 'enzyme';
import {
    getMockContext,
    mockProductDateInformationFieldsets,
    mockProductDateInformationFieldsetsWithInputErrors,
    mockProductRadioErrors,
} from '../testData/mockData';
import ProductDateInfo, { getFieldsets, getServerSideProps } from '../../src/pages/productDateInformation';
import { ErrorInfo, ProductDateInformation } from '../../src/interfaces';
import { PRODUCT_DATE_ATTRIBUTE } from '../../src/constants/attributes';

describe('pages', () => {
    describe('productDateInformation', () => {
        it('it should render the product date information page', () => {
            const wrapper = shallow(
                <ProductDateInfo errors={[]} fieldsets={mockProductDateInformationFieldsets} csrfToken="" />,
            );
            expect(wrapper).toMatchSnapshot();
        });
        it('it should render errors correctly when radio errors are passed to the page', () => {
            const wrapper = shallow(
                <ProductDateInfo
                    errors={mockProductRadioErrors}
                    fieldsets={mockProductDateInformationFieldsets}
                    csrfToken=""
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('getProductDateInformationFieldSets', () => {
        const mockDates: ProductDateInformation = {
            startDateDay: '',
            startDateMonth: '',
            startDateYear: '',
            endDateDay: '',
            endDateMonth: '',
            endDateYear: '',
        };

        const mockDatesWithErrors: ProductDateInformation = {
            startDateDay: '',
            startDateMonth: '12',
            startDateYear: '2020',
            endDateDay: '',
            endDateMonth: '12',
            endDateYear: '2020',
        };

        it('it should return a fieldset containing two text inputs with no errors when no errors are passed', () => {
            const errors: ErrorInfo[] = [];
            const fieldset = getFieldsets(errors, mockDates);
            expect(fieldset).toEqual(mockProductDateInformationFieldsets);
        });

        it('it should return a fieldset containing two text inputs with errors attached when errors are passed', () => {
            const errors: ErrorInfo[] = [
                {
                    id: 'start-date-day',
                    errorMessage: 'Start date must be a real date',
                },
                {
                    id: 'end-date-day',
                    errorMessage: 'End date must be a real date',
                },
            ];
            const fieldset = getFieldsets(errors, mockDatesWithErrors);
            expect(fieldset).toEqual(mockProductDateInformationFieldsetsWithInputErrors);
        });

        describe('getServerSideProps', () => {
            it('it should return props containing no errors and valid fieldsets when no product session is present', () => {
                const ctx = getMockContext();
                const result = getServerSideProps(ctx);

                expect(result.props.errors).toEqual([]);
                expect(result.props.fieldsets).toEqual(mockProductDateInformationFieldsets);
            });

            it('it should return props containing no errors and valid fieldsets when no are present', () => {
                const ctx = getMockContext({
                    session: {
                        [PRODUCT_DATE_ATTRIBUTE]: { errors: [], dates: mockDates },
                    },
                });
                const result = getServerSideProps(ctx);

                expect(result.props.errors).toEqual([]);
                expect(result.props.fieldsets).toEqual(mockProductDateInformationFieldsets);
            });

            it('it should return props containing errors and valid fieldsets when radio and all input errors are present', () => {
                const errors: ErrorInfo[] = [
                    {
                        id: 'start-date-day',
                        errorMessage: 'Start date must be a real date',
                    },
                    {
                        id: 'end-date-day',
                        errorMessage: 'End date must be a real date',
                    },
                ];

                const ctx = getMockContext({
                    session: {
                        [PRODUCT_DATE_ATTRIBUTE]: { errors, dates: mockDatesWithErrors },
                    },
                });
                const result = getServerSideProps(ctx);

                expect(result.props.errors).toEqual(errors);
                expect(result.props.fieldsets).toEqual(mockProductDateInformationFieldsetsWithInputErrors);
            });
        });
    });
});
