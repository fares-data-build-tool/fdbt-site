/* eslint-disable global-require */

import * as React from 'react';
import { shallow } from 'enzyme';
import ServiceList, { SelectedServiceProps } from '../../src/pages/serviceList';

const serviceInfo: SelectedServiceProps = {
    service: {
        selectedServices: [],
        error: false,
    },
    buttonText: 'Select All',
};

describe('pages', () => {
    describe('serviceList', () => {
        it('should render correctly', () => {
            // eslint-disable-next-line react/jsx-props-no-spreading
            const tree = shallow(<ServiceList {...serviceInfo} />);
            expect(tree).toMatchSnapshot();
        });
    });
});
