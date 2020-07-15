import { NextApiRequest, NextApiResponse } from 'next';
import { redirectTo, redirectToError, setCookieOnResponseObject } from './apiUtils';
import { isSessionValid } from './service/validator';
import { SALES_OFFER_PACKAGE_COOKIE } from '../../constants';

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            const cookieValue = JSON.stringify({ errorMessage: 'Choose at least one service from the options' });
            setCookieOnResponseObject(SALES_OFFER_PACKAGE_COOKIE, cookieValue, req, res);
            redirectTo(res, `/selectSalesOfferPackage`);
            return;
        }

        const checkedSalesOfferPackageList: string[] = [];

        const requestBody: { [key: string]: string | string[] } = req.body;

        Object.entries(requestBody).forEach(entry => {
            const name = entry[0];
            const packageDescription = entry[1];
            const data = `${name}#${packageDescription}`;
            checkedSalesOfferPackageList.push(data);
        });

        setCookieOnResponseObject(
            SALES_OFFER_PACKAGE_COOKIE,
            JSON.stringify({ checkedSalesOfferPackageList }),
            req,
            res,
        );

        redirectTo(res, '/thankyou');
        return;
    } catch (error) {
        const message =
            'There was a problem processing the selected sales offer packages from the salesOfferPackage page:';
        redirectToError(res, message, error);
    }
};
