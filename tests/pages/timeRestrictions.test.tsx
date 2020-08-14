import * as React from 'react';
import { shallow } from 'enzyme';
import TimeRestrictions from '../../src/pages/timeRestrictions';

describe('pages', () => {
    describe('timeRestrictions', () => {
        it('should render correctly', () => {
            const tree = shallow(
                <TimeRestrictions timeRestrictionsInfo={{ timeRestrictions: false }} csrfToken="" pageProps={[]} />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
});
