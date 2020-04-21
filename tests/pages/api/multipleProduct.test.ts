import { checkProductDurationsAreValid , containsErrors, getErrorsForCookie } from "../../../src/pages/api/multipleProduct";
import { multipleProducts, multipleProductsWithoutErrors, durationProducts } from "../../testData/mockData";


describe('multiple product data sorting methods', () => {

    it('returns error summary info given a list of products', () => {
        const errors = getErrorsForCookie(multipleProducts);
        expect(errors.errors.length).toBe(3);
    });

    it('returns true if a product list has errors', () => {
        const result = containsErrors(multipleProducts);
        expect(result).toBeTruthy();
    });

    it('returns false if a product list has no errors', () => {
        const result = containsErrors(multipleProductsWithoutErrors);
        expect(result).toBeFalsy();
    });

    it('adds duration errors to a product with invalid duration', () => {
        const result = checkProductDurationsAreValid(durationProducts);
        expect(result[0].productDurationError).toBeUndefined();
        expect(result[1].productDurationError).toBe("Product duration cannot be zero or negative.");
        expect(result[2].productDurationError).toBe("Product duration cannot be zero or negative.");
        expect(result[3].productDurationError).toBe("Product duration cannot be empty.");
        expect(result[4].productDurationError).toBe("Product duration must be a whole, positive number.");
    })
});