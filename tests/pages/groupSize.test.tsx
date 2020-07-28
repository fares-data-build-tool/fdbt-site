import * as React from 'react';
import { shallow } from 'enzyme';
import GroupSize from '../../src/pages/groupSize';

describe('pages', () => {
    describe('groupSize', () => {
        it('should render correctly', () => {
            const tree = shallow(<GroupSize groupTicketInfo={{ maxGroupSize: '' }} csrfToken="" pageProps={[]} />);
            expect(tree).toMatchSnapshot();
        });

        it('should render error messaging when errors are passed', () => {
            const tree = shallow(
                <GroupSize
                    groupTicketInfo={{
                        maxGroupSize: 'not a number',
                        errors: [
                            {
                                errorMessage: 'Enter a whole number between 1 and 30',
                                id: 'max-group-size',
                                userInput: 'not a number',
                            },
                        ],
                    }}
                    csrfToken=""
                    pageProps={[]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
});
