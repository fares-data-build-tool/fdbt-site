import * as React from 'react';
import { shallow } from 'enzyme';
import Index from '../../src/pages/index';

describe('pages', () => {
    describe('operator', () => {
        it('should render correctly', () => {
            const tree = shallow(<Index redirect="/fareType" csrfToken="" pageProps={[]} />);
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly with no multiple operators', () => {
            const tree = shallow(<Index redirect="/multipleOperators" csrfToken="" pageProps={[]} />);
            expect(tree).toMatchSnapshot();
        });
    });
});
