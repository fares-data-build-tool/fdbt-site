import * as React from 'react';
import { shallow } from 'enzyme';
import {
    mockProductDateInformationFieldsets,
    mockProductDateInformationFieldsetsWithInputErrors,
    mockProductRadioErrors,
} from '../testData/mockData';
import ProductDateInfo, { getFieldsets } from '../../src/pages/productDateInformation';
import { ErrorInfo } from '../../src/interfaces';

describe('pages', () => {
    describe('productDateInformation', () => {
        it('should render the product date information page', () => {
            const wrapper = shallow(
                <ProductDateInfo
                    errors={[]}
                    fieldsets={mockProductDateInformationFieldsets}
                    csrfToken=""
                    dates={{
                        startDateDay: '',
                        startDateMonth: '',
                        startDateYear: '',
                        endDateDay: '',
                        endDateMonth: '',
                        endDateYear: '',
                    }}
                    pageProps={[]}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
        it('should render errors correctly when radio errors are passed to the page', () => {
            const wrapper = shallow(
                <ProductDateInfo
                    errors={mockProductRadioErrors}
                    fieldsets={mockProductDateInformationFieldsetsWithInputErrors}
                    csrfToken=""
                    dates={{
                        startDateDay: '',
                        startDateMonth: '',
                        startDateYear: '',
                        endDateDay: '',
                        endDateMonth: '',
                        endDateYear: '',
                    }}
                    pageProps={[]}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('getProductDateInformationFieldSets', () => {
        it('should return a fieldset containing two text inputs with no errors when no errors are passed', () => {
            const errors: ErrorInfo[] = [];
            const fieldset = getFieldsets(errors);
            expect(fieldset).toEqual(mockProductDateInformationFieldsets);
        });

        it('should return a fieldset containing two text inputs with errors attached when errors are passed', () => {
            const errors: ErrorInfo[] = [
                {
                    id: 'start-date',
                    errorMessage: 'Start date must be a real date',
                },
                {
                    id: 'end-date',
                    errorMessage: 'End date must be a real date',
                },
            ];
            const fieldset = getFieldsets(errors);
            expect(fieldset).toEqual(mockProductDateInformationFieldsetsWithInputErrors);
        });
    });
});
