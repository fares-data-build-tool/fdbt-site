import * as React from 'react';
import { shallow } from 'enzyme';
import Register from '../../src/pages/register';

describe('pages', () => {
    describe('register', () => {
        it('should render correctly', () => {
            const tree = shallow(<Register inputChecks={[]} errors={[]} />);
            expect(tree).toMatchSnapshot();
        });

        it('should render error messaging when errors are passed', () => {
            const tree = shallow(
                <Register
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
                <Register
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
