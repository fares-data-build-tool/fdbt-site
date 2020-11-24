import * as React from 'react';
import { shallow } from 'enzyme';
import PeriodValidity from '../../src/pages/periodValidity';
import { mockPeriodValidityFieldsets } from '../testData/mockData';

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
});
