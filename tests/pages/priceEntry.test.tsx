import * as React from 'react';
import { shallow } from 'enzyme';
import PriceEntry, { getServerSideProps } from '../../src/pages/priceEntry';
import { STAGE_NAMES_COOKIE } from '../../src/constants';
import { getMockContext } from 'tests/testData/mockData';

const mockFareStages: string[] = [
    'Briggate',
    'Chapeltown',
    'Chapel Allerton',
    'Moortown',
    'Harrogate Road',
    'Harehills',
    'Gipton',
    'Armley',
    'Stanningley',
    'Pudsey',
    'Seacroft',
    'Rothwell',
    'Dewsbury',
    'Wakefield',
];

describe('Price Entry Page', () => {
    it('should render correctly', () => {
        const tree = shallow(<PriceEntry stageNamesArray={mockFareStages} csrfToken="" pageProps={[]} />);
        expect(tree).toMatchSnapshot();
    });

    it('should return an error info array if there are errors present in cookie', () => {
        const stageNames = ['Bewbush', 'Chorlton', 'Green Lane', 'Ashbury'];
        const ctx = getMockContext({ cookies: { } });
    })

});
