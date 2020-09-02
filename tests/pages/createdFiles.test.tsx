import * as React from 'react';
import { shallow } from 'enzyme';
import CreatedFiles from '../../src/pages/createdFiles';
import { S3NetexFile } from '../../src/interfaces';

const netexFiles: S3NetexFile[] = [
    {
        name: 'Test Name',
        fareType: 'single',
        noc: 'TEST',
        passengerType: 'adult',
        reference: 'TEST12345',
        date: 'Tue, 01 Sep 2020 14:46:58 GMT',
        signedUrl: 'https://test.example.com/dscsdcd',
        sopNames: 'Test SOP Name, Test SOP Name 2',
        lineName: 'X01',
    },
    {
        name: 'Test Name 2',
        fareType: 'flatFare',
        noc: 'TEST2',
        passengerType: 'child',
        reference: 'TEST54321',
        date: 'Wed, 02 Sep 2020 14:46:58 GMT',
        signedUrl: 'https://test.example.com/gfnhgddd',
        sopNames: 'Test SOP Name 2',
        serviceNames: '1, 56, X02',
        productNames: 'Product 1, Product 2',
    },
];

describe('pages', () => {
    describe('createdFiles', () => {
        it('should render correctly', () => {
            const tree = shallow(<CreatedFiles files={netexFiles} />);
            expect(tree).toMatchSnapshot();
        });
    });
});
