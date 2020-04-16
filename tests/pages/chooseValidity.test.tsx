/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { shallow } from 'enzyme';
import ChooseValidity from '../../src/pages/chooseValidity';

describe('Choose Validity Page', () => {
    it('should render correctly', () => {
        const tree = shallow(<ChooseValidity productName="bus company" productPrice="£3.00" daysValid="" error="" />);
        expect(tree).toMatchSnapshot();
    });
});
