/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { shallow } from 'enzyme';
import React from 'react';
import MultipleProduct, { getServerSideProps } from '../../src/pages/multipleProduct';
import { getMockContext } from '../testData/mockData';

describe('pages', () => {
    describe('multipleProduct', () => {
        it('should render correctly', () => {
            const wrapper = shallow(
                <MultipleProduct
                    numberOfProductsToDisplay="2"
                    nameOfOperator="Infinity Line"
                    errors={[]}
                    userInput={[]}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('server side props', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        it('should return number of products to display and name of operator if there is no cookie set', () => {
            const ctx = getMockContext({
                operator: 'BLP',
                numberOfProductsInput: '2',
            });
            const result = getServerSideProps(ctx);

            expect(result.props.numberOfProductsToDisplay).toBe('2');
            expect(result.props.nameOfOperator).toBe('BLP');
        });

        it('should throw an error if the necessary cookies to render the page are not present', () => {
            const ctx = getMockContext({
                operator: null,
                numberOfProductsInput: null,
            });
            expect(() => getServerSideProps(ctx)).toThrow('Necessary cookies not found to show multiple products page');
        });
    });
});