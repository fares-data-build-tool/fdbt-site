/* eslint-disable global-require */

import * as React from 'react';
import { shallow } from 'enzyme';
import ProductDetails from '../../src/pages/productDetails';
import { ProductInfo } from '../../src/interfaces';

const mockproductDetails: ProductInfo = {
    productPrice: '',
    productName: '',
    productNameError: '',
    productPriceError: '',
};

describe('pages', () => {
    describe('productDetails', () => {
        it('should render correctly', () => {
            const tree = shallow(
                <ProductDetails product={mockproductDetails} operator="bus company" hintText="Test Zone" />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
});
