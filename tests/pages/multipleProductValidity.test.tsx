/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { shallow } from 'enzyme';
import React from 'react';
import MultiProductValidity, { getServerSideProps } from '../../src/pages/multipleProductValidity';
import { getMockContext } from '../testData/mockData';

describe('pages', () => {
    describe('multipleProductValidity', () => {
        const wrapper = shallow(
            <MultiProductValidity
                operator="Infinity Line"
                numberOfProducts="2"
                multipleProducts={[
                    {
                        productName: 'super ticket',
                        productPrice: '3.50',
                        productDuration: '3',
                    },
                    {
                        productName: 'best ticket',
                        productPrice: '30.90',
                        productDuration: '30',
                    },
                ]}
                errors={[]}
            />,
        );

        it('should render correctly', () => {
            expect(wrapper).toMatchSnapshot();
        });

        it('renders 2 radio buttons per number of products', () => {
            expect(wrapper.find('.govuk-radios__item')).toHaveLength(4);
        });
    });

    describe('server side props', () => {
        it('should return number of products to display, name of operator and products if they are set in the cookie', () => {
            const ctx = getMockContext();
            const result = getServerSideProps(ctx);

            expect(result.props.numberOfProducts).toBe('2');
            expect(result.props.operator).toBe('test');
            expect(result.props.multipleProducts[0].productName).toBe('Best Product');
            expect(result.props.multipleProducts[0].productPrice).toBe('2');
            expect(result.props.multipleProducts[0].productDuration).toBe('3');
            expect(result.props.multipleProducts.length).toBe(3);
        });

        it('should throw an error if the necessary cookies to render the page are not present', () => {
            const ctx = getMockContext({
                operator: null,
                numberOfProductsInput: null,
                multipleProduct: null,
            });
            expect(() => getServerSideProps(ctx)).toThrow(
                'Necessary cookies not found to display the multiple product vaidity page',
            );
        });

        it('returns errors in the props if there are validity errors on the product object', () => {
            const ctx = getMockContext({
                multipleProducts: [
                    {
                        productName: 'Best Product',
                        productNameId: 'multipleProductNameInput0',
                        productPrice: '2',
                        productPriceId: 'multipleProductPriceInput0',
                        productDuration: '3',
                        productDurationId: 'multipleProductDurationInput0',
                        productValidity: {
                            validity: '',
                            error: 'Select one of the two validity options',
                        }
                    },
                    {
                        productName: 'Super Product',
                        productNameId: 'multipleProductNameInput1',
                        productPrice: '3',
                        productPriceId: 'multipleProductPriceInput1',
                        productDuration: '4',
                        productDurationId: 'multipleProductDurationInput1',
                        productValidity: {
                            validity: '24hrs',
                            error: '',
                        }
                    },
                ],
            });

            const result = getServerSideProps(ctx);

            expect(result.props.multipleProducts.length).toBe(2);
            expect(result.props.errors.length).toBe(1);
            expect(result.props.errors[0].errorMessage).toBe('Select one of the two validity options');
            expect(result.props.errors[0].id).toBe('multiple-product-validity-radios-error');
        });
    });
});
