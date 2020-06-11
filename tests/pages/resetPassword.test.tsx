import * as React from 'react';
import { shallow } from 'enzyme';
import ResetPassword from '../../src/pages/resetPassword';

describe('reset password page', () => {
    describe('reset password', () => {
        let expiryDate: number;

        beforeEach(() => {
            expiryDate = Math.abs(new Date(2020, 5, 30).getUTCSeconds());
        });

        it('should render correctly', () => {
            const tree = shallow(
                <ResetPassword
                    username="test@tfn.com"
                    regKey="123456"
                    expiry={expiryDate.toString()}
                    csrfToken=""
                    errors={[]}
                    pageProps={[]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render error messaging when errors are passed', () => {
            const tree = shallow(
                <ResetPassword
                    username="test@tfn.com"
                    regKey="123456"
                    expiry={expiryDate.toString()}
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
});
