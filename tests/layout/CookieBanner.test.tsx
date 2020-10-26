import * as React from 'react';
import { shallow } from 'enzyme';
import CookieBanner from '../../src/layout/CookieBanner';

describe('CookieBanner', () => {
    it('should render correctly', () => {
        const tree = shallow(<CookieBanner />);
        expect(tree).toMatchSnapshot();
    });
});
