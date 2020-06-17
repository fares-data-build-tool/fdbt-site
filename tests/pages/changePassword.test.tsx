import * as React from 'react';
import { shallow } from 'enzyme';
import ChangePassword from '../../src/pages/changePassword';

describe('changePassword', () => {
    it('should render correctly', () => {
        const tree = shallow(<ChangePassword csrfToken="" pageProps={[]} errors={[]} />);
        expect(tree).toMatchSnapshot();
    });

    it('should render error messaging when errors are passed', () => {
        const tree = shallow(
            <ChangePassword
                csrfToken=""
                pageProps={[]}
                errors={[
                    {
                        errorMessage: 'Passwords do not match',
                        id: 'password',
                    },
                ]}
            />,
        );
        expect(tree).toMatchSnapshot();
    });
});
