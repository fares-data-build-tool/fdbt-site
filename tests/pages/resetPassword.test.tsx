import * as React from 'react';
import { shallow } from 'enzyme';
import ResetPassword from '../../src/pages/resetPassword';

const expiryDate = Math.abs(new Date(2020, 5, 30).getTime() / 1000);

describe('pages', () => {
    describe('reset password', () => {
        it('should render correctly', () => {
            const tree = shallow(
                <ResetPassword username="test@tfn.com" regKey="123456" expiry={expiryDate.toString()} errors={[]} />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render error messaging when errors are passed', () => {
            const tree = shallow(
                <ResetPassword
                    username="test@tfn.com"
                    regKey="123456"
                    expiry={expiryDate.toString()}
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
