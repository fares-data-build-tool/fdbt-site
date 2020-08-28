import * as React from 'react';
import { shallow } from 'enzyme';
import { getMockContext } from '../testData/mockData';
import FareType, { buildUuid } from '../../src/pages/fareType';

describe('pages', () => {
    const mockErrors = [{ errorMessage: 'Choose a fare type from the options', id: 'fare-type-error' }];

    describe('fareType', () => {
        it('should render correctly', () => {
            const tree = shallow(<FareType operator={' '} errors={[]} csrfToken="" pageProps={[]} />);
            expect(tree).toMatchSnapshot();
        });

        it('should render error messaging when errors are passed to the page', () => {
            const tree = shallow(<FareType operator={' '} errors={mockErrors} csrfToken="" pageProps={[]} />);
            expect(tree).toMatchSnapshot();
        });
    });

    describe('buildUUid', () => {
        it('should return a string starting with the NOC and then 8 characters of uuid', () => {
            const ctx = getMockContext({
                cookies: {
                    idToken:
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b206bm9jIjoiVEVTVCJ9.0UFph720FgN250bsFAXMAWV43eUecYkFP1g4VGwZCW8',
                },
            });

            const result = buildUuid(ctx);

            expect(result.substring(0, 4)).toBe('TEST');
            expect(result.length).toBe(12);
        });
    });
});
