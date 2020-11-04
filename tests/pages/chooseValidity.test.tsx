import React from 'react';
import { shallow } from 'enzyme';
import ChooseValidity from '../../src/pages/chooseValidity';

describe('Choose Validity Page', () => {
    it('should render correctly', () => {
        const tree = shallow(
            <ChooseValidity
                productName="bus company"
                productPrice="£3.00"
                passengerType="Adult"
                amount=""
                timePeriodType=""
                errors={[]}
                csrfToken=""
            />,
        );
        expect(tree).toMatchSnapshot();
    });
    it('should render correctly with defaults when provided', () => {
        const tree = shallow(
            <ChooseValidity
                productName="bus company"
                productPrice="£3.00"
                passengerType="Adult"
                amount="2"
                timePeriodType="day"
                errors={[]}
                csrfToken=""
            />,
        );
        expect(tree).toMatchSnapshot();
    });
});
