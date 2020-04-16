import * as React from 'react';
import { shallow } from 'enzyme';

import HowManyProducts, { InputCheck, getPreviousPage } from '../../src/pages/howManyProducts';

describe('pages', () => {
    describe('howManyProducts', () => {
        const previousPages: string[] = ['csvZoneUpload', 'singleOperator'];

        test.each(previousPages)(
            'should render correctly when a user first visits the page from the %p page',
            mockPreviousPage => {
                const mockInputCheck: InputCheck = {};
                const tree = shallow(<HowManyProducts previousPage={mockPreviousPage} inputCheck={mockInputCheck} />);
                expect(tree).toMatchSnapshot();
            },
        );

        const errorCases: any[] = [
            ['csvZoneUpload', { error: 'Enter a whole number between 1 and 10', numberOfProductsInput: '0' }],
            ['singleOperator', { error: 'Enter a whole number between 1 and 10', numberOfProductsInput: '11' }],
            ['unknown', { error: 'Enter a whole number between 1 and 10', numberOfProductsInput: '99' }],
            ['csvZoneUpload', { error: 'Enter a whole number between 1 and 10', numberOfProductsInput: '4.65' }],
            [
                'singleOperator',
                { error: 'Enter a number', numberOfProductsInput: 'some strange thing a user would type' },
            ],
            ['unknown', { error: 'Enter a whole number between 1 and 10', numberOfProductsInput: '' }],
            ['singleOperator', { error: 'Enter a whole number between 1 and 10', numberOfProductsInput: '       ' }],
        ];

        test.each(errorCases)(
            'should render correctly when a user is redirected to the page from itself when incorrect data is entered',
            (mockPreviousPage, mockInputCheck) => {
                const tree = shallow(<HowManyProducts previousPage={mockPreviousPage} inputCheck={mockInputCheck} />);
                expect(tree).toMatchSnapshot();
            },
        );
    });
    describe('getPreviousPage', () => {
        const cookies: {}[] = [
            [{}, 'singleOperator'],
            [
                {
                    'fdbt-csv-zone-upload':
                        '{"fareZoneName":"Test Town Centre","uuid":"3181aed6-4f15-40c0-9802-c734e41c2b79"}',
                },
                'csvZoneUpload',
            ],
        ];
        test.each(cookies)(
            'should return the correct previousPage based on whether a CSV_ZONE_UPLOAD_COOKIE is present',
            (mockCookie, mockPreviousPage) => {
                const actualPreviousPage = getPreviousPage(mockCookie);
                expect(actualPreviousPage).toEqual(mockPreviousPage);
            },
        );
    });
});
