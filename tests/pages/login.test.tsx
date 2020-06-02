import * as React from 'react';
import { shallow } from 'enzyme';
import Login from '../../src/pages/login';

describe('pages', () => {
    describe('register', () => {
        it('should render correctly', () => {
            const tree = shallow(<Login inputChecks={[]} errors={[]} />);
            expect(tree).toMatchSnapshot();
        });

        it('should render error messaging when errors are passed', () => {
            const tree = shallow(
                <Login
                    inputChecks={[]}
                    errors={[
                        {
                            errorMessage: 'Enter an email address in the correct format, like name@example.com',
                            id: 'email',
                        },
                    ]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should store email if entered correctly but other fields fail validation', () => {
            const tree = shallow(
                <Login
                    inputChecks={[{ inputValue: 'test@tfn.com', error: '', id: 'email' }]}
                    errors={[
                        {
                            errorMessage: 'Enter valid nocCode',
                            id: 'nocCode',
                        },
                    ]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
});
