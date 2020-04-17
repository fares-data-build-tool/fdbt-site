import { NextApiRequest, NextApiResponse } from "next";
import { isSessionValid } from "./service/validator";
import { getUuidFromCookie, setCookieOnResponseObject, getDomain, redirectTo, redirectToError } from "./apiUtils";
import { MULTIPLE_SERVICE_COOKIE } from "../../constants";
import { checkIfInputInvalid } from "./periodProduct";

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const uuid = getUuidFromCookie(req, res);

        const { periodProductNameInput, periodProductPriceInput } = req.body;

        const periodProduct = checkIfInputInvalid(periodProductNameInput, periodProductPriceInput, uuid);

        if (periodProduct.productNameError !== '' || periodProduct.productPriceError !== '') {
            const invalidInputs = JSON.stringify(periodProduct);

            setCookieOnResponseObject(getDomain(req), MULTIPLE_SERVICE_COOKIE, invalidInputs, req, res);
            redirectTo(res, '/periodProduct');
            return;
        }

        const validInputs = JSON.stringify(periodProduct);

        setCookieOnResponseObject(getDomain(req), MULTIPLE_SERVICE_COOKIE, validInputs, req, res);

        redirectTo(res, '/chooseValidity');
    } catch (error) {
        const message = 'There was a problem inputting the product name and price:';
        redirectToError(res, message, error);
    }
};
