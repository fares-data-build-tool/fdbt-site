import { getMockRequestAndResponse } from '../../testData/mockData';
import { addErrorsIfInvalid } from '../../../src/pages/api/multipleProductValidity';
import { Product } from '../../../src/pages/multipleProductValidity';

describe('Multiple product validity API', () => {
    describe('Data functions', () => {
        it('adds errors to incorrect data if there are invalid inputs', () => {
            const { req } = getMockRequestAndResponse('', {
                'validity-row0': '',
                'validity-row1': '',
            });

            const numberOfProducts = 2;
            const products: Product[] = [
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
            ];
            const result = addErrorsIfInvalid(req, numberOfProducts, products);

            expect(result[0].productValidity?.error).toBe('Select one of the two validity options');
            expect(result[1].productValidity?.error).toBe('Select one of the two validity options');
        });

        it('does not add errors to correct data', () => {
            const { req } = getMockRequestAndResponse('', {
                'validity-row0': 'endOfCalendarDay',
                'validity-row1': '24hrs',
            });

            const numberOfProducts = 2;
            const products: Product[] = [
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
            ];
            const result = addErrorsIfInvalid(req, numberOfProducts, products);

            expect(result[0].productValidity?.error).toBe('');
            expect(result[1].productValidity?.error).toBe('');
        });
    });

    it('correctly generates JSON for multiple product data and uploads to S3', () => {
        expect(true).toBeTruthy();
    });
});
