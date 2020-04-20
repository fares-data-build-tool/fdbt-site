import * as React from 'react';
import { shallow } from 'enzyme';

import HowManyProducts, { InputCheck } from '../../src/pages/howManyProducts';
import { ErrorInfo } from '../../src/types';

type ErrorCase = [string, { error: string; numberOfProductsInput: string }];

describe('pages', () => {
    describe('howManyProducts', () => {
        const pageHeadingMessages: string[][] = [
            ['csvZoneUpload', 'How many products do you have for this zone?'],
            ['singleOperator', 'How many products do you have for your selected services?'],
        ];

        test.each(pageHeadingMessages)(
            'should render correctly when a user first visits the page from the %p page',
            (_previousPage, pageHeadingMessage) => {
                const mockInputCheck: InputCheck = {};
                const mockErrors: ErrorInfo[] = [];
                const tree = shallow(
                    <HowManyProducts
                        pageHeadingMessage={pageHeadingMessage}
                        inputCheck={mockInputCheck}
                        errors={mockErrors}
                    />,
                );
                expect(tree).toMatchSnapshot();
            },
        );

        const errorCases: ErrorCase[] = [
            [
                'How many products do you have for this zone?',
                { error: 'Enter a whole number between 1 and 10', numberOfProductsInput: '0' },
            ],
            [
                'How many products do you have for your selected services?',
                { error: 'Enter a whole number between 1 and 10', numberOfProductsInput: '11' },
            ],
            [
                'How many products do you have for this zone or selected services?',
                { error: 'Enter a whole number between 1 and 10', numberOfProductsInput: '99' },
            ],
            [
                'How many products do you have for this zone?',
                { error: 'Enter a whole number between 1 and 10', numberOfProductsInput: '4.65' },
            ],
            [
                'How many products do you have for your selected services?',
                { error: 'Enter a number', numberOfProductsInput: 'some strange thing a user would type' },
            ],
            [
                'How many products do you have for this zone or selected services?',
                { error: 'Enter a whole number between 1 and 10', numberOfProductsInput: '' },
            ],
            [
                'How many products do you have for your selected services?',
                { error: 'Enter a whole number between 1 and 10', numberOfProductsInput: '       ' },
            ],
        ];

        test.each(errorCases)(
            'should render correctly when a user is redirected to the page from itself when incorrect data is entered',
            (pageHeadingMessage, mockInputCheck) => {
                const mockErrors = [{ errorMessage: mockInputCheck.error, id: 'page-heading' }];
                const tree = shallow(
                    <HowManyProducts
                        pageHeadingMessage={pageHeadingMessage}
                        inputCheck={mockInputCheck}
                        errors={mockErrors}
                    />,
                );
                expect(tree).toMatchSnapshot();
            },
        );
    });
});
