import productDetails from '../../../src/pages/api/productDetails';
import { PRODUCT_DETAILS_COOKIE } from '../../../src/constants';
import * as validator from '../../../src/pages/api/service/validator';
import * as apiUtils from '../../../src/pages/api/apiUtils';
import { getMockRequestAndResponse } from '../../testData/mockData';

describe('productDetails', () => {
    beforeEach(() => {
        jest.resetAllMocks();

        jest.spyOn(validator, 'isSessionValid')
            .mockImplementation()
            .mockReturnValue(true);
    });

    it('should set period product cookie with errors on submit', () => {
        const setCookieSpy = jest.spyOn(apiUtils, 'setCookieOnResponseObject');

        const { req, res } = getMockRequestAndResponse(
            { fareType: 'period' },
            { productDetailsNameInput: '', productDetailsPriceInput: '' },
        );

        const mockProductDetailsCookies = {
            uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
            productName: '',
            productPrice: '',
            productNameError: 'Product name cannot have less than 2 characters',
            productPriceError: 'This field cannot be empty',
        };

        productDetails(req, res);

        expect(setCookieSpy).toHaveBeenCalledWith(
            'localhost',
            PRODUCT_DETAILS_COOKIE,
            JSON.stringify(mockProductDetailsCookies),
            req,
            res,
        );
    });

    it('should create period product cookie if submit is valid', () => {
        const setCookieSpy = jest.spyOn(apiUtils, 'setCookieOnResponseObject');

        const { req, res } = getMockRequestAndResponse(
            { fareType: 'period' },
            {
                productDetailsNameInput: 'ProductA',
                productDetailsPriceInput: '121',
                uuid: '1e0459b3-082e-4e70-89db-96e8ae173e1',
            },
        );

        const mockProductDetailsCookies = {
            uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
            productName: 'ProductA',
            productPrice: '121',
            productNameError: '',
            productPriceError: '',
        };

        productDetails(req, res);

        expect(setCookieSpy).toHaveBeenCalledWith(
            'localhost',
            PRODUCT_DETAILS_COOKIE,
            JSON.stringify(mockProductDetailsCookies),
            req,
            res,
        );
    });

    it('should remove leading trailing spaces and tabs', () => {
        const setCookieSpy = jest.spyOn(apiUtils, 'setCookieOnResponseObject');

        const { req, res } = getMockRequestAndResponse(
            { fareType: 'period' },
            {
                productDetailsNameInput: '     ProductBA',
                productDetailsPriceInput: '121',
                uuid: '1e0459b3-082e-4e70-89db-96e8ae173e1',
            },
        );

        const mockProductDetailsCookies = {
            uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
            productName: 'ProductBA',
            productPrice: '121',
            productNameError: '',
            productPriceError: '',
        };

        productDetails(req, res);

        expect(setCookieSpy).toHaveBeenCalledWith(
            'localhost',
            PRODUCT_DETAILS_COOKIE,
            JSON.stringify(mockProductDetailsCookies),
            req,
            res,
        );
    });
});
