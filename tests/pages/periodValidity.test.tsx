import * as React from 'react';
import { shallow } from 'enzyme';
import PeriodValidity, { getFieldsets } from '../../src/pages/periodValidity';
import {
    mockPeriodValidityFieldsets,
    mockPeriodValidityFieldsetsWithErrors,
    mockPeriodValidityInputsWithErrors,
} from '../testData/mockData';
import { ErrorInfo } from '../../src/interfaces';

describe('pages', () => {
    describe('periodValidity', () => {
        it('should render correctly', () => {
            const tree = shallow(<PeriodValidity errors={[]} csrfToken="" fieldsets={mockPeriodValidityFieldsets} />);
            expect(tree).toMatchSnapshot();
        });

        it('should render error messaging when errors are passed', () => {
            const tree = shallow(
                <PeriodValidity
                    errors={[
                        {
                            errorMessage: 'Choose an option regarding your period ticket validity',
                            id: 'period-validity-error',
                        },
                    ]}
                    csrfToken=""
                    fieldsets={mockPeriodValidityFieldsets}
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
    describe('getFieldsets', () => {
        it('should return fieldsets with no errors when no errors are passed', () => {
            const emptyErrors: ErrorInfo[] = [];
            const fieldsets = getFieldsets(emptyErrors);
            expect(fieldsets).toEqual(mockPeriodValidityFieldsets);
        });

        it('should return fieldsets with radio errors when radio errors are passed', () => {
            const radioErrors: ErrorInfo[] = [
                {
                    errorMessage: 'Choose one of the validity options',
                    id: 'period-end-calendar',
                },
            ];
            const fieldsets = getFieldsets(radioErrors);
            expect(fieldsets).toEqual(mockPeriodValidityFieldsetsWithErrors);
        });

        it('should return fieldsets with input errors when input errors are passed', () => {
            const inputErrors: ErrorInfo[] = [
                {
                    errorMessage: 'Specify an end time for service day',
                    id: 'service-end-time',
                },
            ];
            const fieldsets = getFieldsets(inputErrors);
            expect(fieldsets).toEqual(mockPeriodValidityInputsWithErrors);
        });
    });
});
