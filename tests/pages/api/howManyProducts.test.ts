import * as apiUtils from '../../../src/pages/api/apiUtils';
import { NUMBER_OF_PRODUCTS_COOKIE } from '../../../src/constants';
import howManyProducts, { isNumberOfProductsInvalid } from '../../../src/pages/api/howManyProducts';
import { getMockRequestAndResponse } from '../../testData/mockData';
import { InputCheck } from '../../../src/pages/howManyProducts';

describe('howManyProducts', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('isNumberOfProductsInvalid', () => {
        const cases: {}[] = [
            ['invalid', 'no data', { numberOfProductsInput: '', error: 'Enter a number' }],
            ['n invalid', 'a non-numeric string', { numberOfProductsInput: 'I like buses', error: 'Enter a number' }],
            [
                'invalid',
                'a decimal',
                { numberOfProductsInput: '1.353', error: 'Enter a whole number between 1 and 10' },
            ],
            [
                'invalid',
                'a number greater than 10',
                { numberOfProductsInput: '22', error: 'Enter a whole number between 1 and 10' },
            ],
            [
                'invalid',
                'a number less than 1',
                { numberOfProductsInput: '0', error: 'Enter a whole number between 1 and 10' },
            ],
            ['valid', 'an integer between 1 and 10', { numberOfProductsInput: '3', error: '' }],
        ];
        test.each(cases)(
            'should return a %p input check when the user enters %p',
            (_validity, _dataEntered, mockInputCheck: InputCheck) => {
                const mockUserInput = mockInputCheck.numberOfProductsInput;
                const mockBody = { numberOfProductsInput: mockUserInput };
                const { req } = getMockRequestAndResponse({}, mockBody);
                const inputCheck = isNumberOfProductsInvalid(req);
                expect(inputCheck).toEqual(mockInputCheck);
            },
        );
    });

    it('should return 302 redirect to /howManyProducts (i.e. itself) when the session is valid, but there is no request body', () => {
        const mockBody = { numberOfProductsInput: '' };
        const mockWriteHeadFn = jest.fn();
        const { req, res } = getMockRequestAndResponse({}, mockBody, {}, mockWriteHeadFn);
        howManyProducts(req, res);
        expect(mockWriteHeadFn).toBeCalledWith(302, {
            Location: '/howManyProducts',
        });
    });

    it('should return 302 redirect to /multipleProducts when session is valid and request body is present', () => {
        const mockBody = { numberOfProductsInput: '6' };
        const mockWriteHeadFn = jest.fn();
        const { req, res } = getMockRequestAndResponse({}, mockBody, {}, mockWriteHeadFn);
        howManyProducts(req, res);
        expect(mockWriteHeadFn).toBeCalledWith(302, {
            Location: '/multipleProducts',
        });
    });

    it('should return 302 redirect to /error when session is not valid', () => {
        const mockBody = {};
        const mockWriteHeadFn = jest.fn();
        const { req, res } = getMockRequestAndResponse({ operator: null }, mockBody, {}, mockWriteHeadFn);
        howManyProducts(req, res);
        expect(mockWriteHeadFn).toBeCalledWith(302, {
            Location: '/error',
        });
    });

    it('should set the NUMBER_OF_PRODUCTS_COOKIE with values matching the valid data entered by the user ', () => {
        const setCookieSpy = jest.spyOn(apiUtils, 'setCookieOnResponseObject');
        const mockBody = { numberOfProductsInput: '4' };
        const { req, res } = getMockRequestAndResponse({}, mockBody);
        const mockNumberOfProductsCookieValue = '{"numberOfProductsInput":"4"}';
        howManyProducts(req, res);
        expect(setCookieSpy).toHaveBeenCalledWith(
            'localhost',
            NUMBER_OF_PRODUCTS_COOKIE,
            mockNumberOfProductsCookieValue,
            req,
            res,
        );
    });

    it('should set the NUMBER_OF_PRODUCTS_COOKIE with an error message and the invalid data entered by the user', () => {
        const setCookieSpy = jest.spyOn(apiUtils, 'setCookieOnResponseObject');
        const mockBody = { numberOfProductsInput: '1.4565' };
        const { req, res } = getMockRequestAndResponse({}, mockBody);
        const mockInputCheck = '{"numberOfProductsInput":"1.4565","error":"Enter a whole number between 1 and 10"}';
        howManyProducts(req, res);
        expect(setCookieSpy).toBeCalledWith('localhost', NUMBER_OF_PRODUCTS_COOKIE, mockInputCheck, req, res);
    });
});
