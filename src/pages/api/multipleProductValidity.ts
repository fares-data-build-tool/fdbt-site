import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import {
    NUMBER_OF_PRODUCTS_COOKIE,
    MULTIPLE_PRODUCT_COOKIE,
    OPERATOR_COOKIE,
    CSV_ZONE_UPLOAD_COOKIE,
    PERIOD_SINGLE_OPERATOR_SERVICES_COOKIE,
    PERIOD_TYPE_COOKIE,
    MATCHING_DATA_BUCKET_NAME,
} from '../../constants/index';
import { isSessionValid } from './service/validator';
import { redirectToError, setCookieOnResponseObject, getDomain, redirectTo } from './apiUtils';
import { Product } from '../multipleProductValidity';
import { getCsvZoneUploadData, putStringInS3 } from '../../data/s3';
import { batchGetStopsByAtcoCode, Stop } from '../../data/auroradb';

interface DecisionData {
    operatorName: string;
    type: string;
    nocCode: string;
    products: Product[];
    selectedServices?: [];
    zoneName?: string;
    stops?: Stop[];
}

export const addErrorsIfInvalid = (req: NextApiRequest, numberOfProducts: number, products: Product[]): Product[] => {
    const limiter = new Array(numberOfProducts);
    const response: Product[] = [];
    for (let i = 0; i < limiter.length; i += 1) {
        let validity = req.body[`validity-row${i}`];
        let error = '';
        if (!validity) {
            validity = '';
            error = 'Select one of the two validity options';
        }
        const product = {
            productName: products[i].productName,
            productNameId: products[i].productNameId,
            productPrice: products[i].productPrice,
            productPriceId: products[i].productPriceId,
            productDuration: products[i].productDuration,
            productDurationId: products[i].productDurationId,
            productValidity: { validity, error },
        };
        response.push(product);
    }
    return response;
};

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }
        const cookies = new Cookies(req, res);
        const operatorCookie = unescape(decodeURI(cookies.get(OPERATOR_COOKIE) || ''));
        const fareZoneCookie = unescape(decodeURI(cookies.get(CSV_ZONE_UPLOAD_COOKIE) || ''));
        const singleOperatorCookie = unescape(decodeURI(cookies.get(PERIOD_SINGLE_OPERATOR_SERVICES_COOKIE) || ''));
        const periodTypeCookie = unescape(decodeURI(cookies.get(PERIOD_TYPE_COOKIE) || ''));
        const numberOfProductsCookie = unescape(decodeURI(cookies.get(NUMBER_OF_PRODUCTS_COOKIE) || ''));
        const multipleProductCookie = unescape(decodeURI(cookies.get(MULTIPLE_PRODUCT_COOKIE) || ''));

        if (
            numberOfProductsCookie === '' ||
            multipleProductCookie === '' ||
            periodTypeCookie === '' ||
            (operatorCookie === '' && (fareZoneCookie === '' || singleOperatorCookie === ''))
        ) {
            throw new Error('Necessary cookies not found for multiple product validity page');
        }

        const numberOfProducts = Number(JSON.parse(numberOfProductsCookie).numberOfProductsInput);
        const productsFromCookie: Product[] = JSON.parse(multipleProductCookie);
        const products = addErrorsIfInvalid(req, numberOfProducts, productsFromCookie);
        const newMultipleProductCookieValue = JSON.stringify(products);
        setCookieOnResponseObject(getDomain(req), MULTIPLE_PRODUCT_COOKIE, newMultipleProductCookieValue, req, res);

        if (products.some(el => el.productValidity?.error !== '')) {
            redirectTo(res, '/multipleProductValidity');
            return;
        }

        let props = {};
        const { operator, uuid, nocCode } = JSON.parse(operatorCookie);
        const { periodTypeName } = JSON.parse(periodTypeCookie);

        if (fareZoneCookie) {
            const { fareZoneName } = JSON.parse(fareZoneCookie);
            const atcoCodes: string[] = await getCsvZoneUploadData(uuid);
            const zoneStops: Stop[] = await batchGetStopsByAtcoCode(atcoCodes);

            if (zoneStops.length === 0) {
                throw new Error(`No stops found for atcoCodes: ${atcoCodes}`);
            }

            props = {
                zoneName: fareZoneName,
                stops: zoneStops,
            };
        }

        if (singleOperatorCookie) {
            const { selectedServices } = JSON.parse(singleOperatorCookie);
            props = {
                selectedServices,
            };
        }

        const multipleProductPeriod: DecisionData = {
            operatorName: operator,
            type: periodTypeName,
            nocCode,
            products,
            ...props,
        };

        await putStringInS3(
            MATCHING_DATA_BUCKET_NAME,
            `${uuid}.json`,
            JSON.stringify(multipleProductPeriod),
            'application/json; charset=utf-8',
        );
        redirectTo(res, '/multipleProductValidity');
    } catch (error) {
        const message = 'There was a problem collecting the user defined products:';
        redirectToError(res, message, error);
    }
};
