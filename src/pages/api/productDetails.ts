import { NextApiResponse } from 'next';
import Cookies from 'cookies';
import { NextApiRequestWithSession, ProductInfo, ServicesInfo } from '../../interfaces/index';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import {
    redirectTo,
    redirectToError,
    unescapeAndDecodeCookie,
    getNocFromIdToken,
    getAttributeFromIdToken,
} from './apiUtils';
import { isSessionValid } from './service/validator';

import {
    PRODUCT_DETAILS_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
    OPERATOR_COOKIE,
    SERVICE_LIST_ATTRIBUTE,
    MATCHING_DATA_BUCKET_NAME,
    PASSENGER_TYPE_ATTRIBUTE,
} from '../../constants';
import { removeExcessWhiteSpace, checkPriceIsValid, checkProductNameIsValid } from './service/inputValidator';
import { putStringInS3 } from '../../data/s3';
import { DecisionData } from './periodValidity';

export const checkIfInputInvalid = (productDetailsNameInput: string, productDetailsPriceInput: string): ProductInfo => {
    let productNameError = '';
    let productPriceError = '';

    const cleanedNameInput = removeExcessWhiteSpace(productDetailsNameInput);
    const cleanedPriceInput = removeExcessWhiteSpace(productDetailsPriceInput);

    productNameError = checkProductNameIsValid(cleanedNameInput);

    productPriceError = checkPriceIsValid(cleanedPriceInput);

    return {
        productName: cleanedNameInput,
        productPrice: cleanedPriceInput,
        productNameError,
        productPriceError,
    };
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const { fareType } = getSessionAttribute(req, FARE_TYPE_ATTRIBUTE);
        const cookies = new Cookies(req, res);

        if (!fareType || (fareType !== 'period' && fareType !== 'flatFare')) {
            throw new Error('Failed to retrieve FARE_TYPE_ATTRIBUTE info for productDetails API');
        }

        const { productDetailsNameInput, productDetailsPriceInput } = req.body;

        const productDetails = checkIfInputInvalid(productDetailsNameInput, productDetailsPriceInput);

        if (productDetails.productNameError !== '' || productDetails.productPriceError !== '') {
            const invalidInputs = JSON.stringify(productDetails);
            updateSessionAttribute(req, PRODUCT_DETAILS_ATTRIBUTE, { body: invalidInputs });
            redirectTo(res, '/productDetails');
            return;
        }

        if (fareType === 'period') {
            const validInputs = JSON.stringify(productDetails);
            updateSessionAttribute(req, PRODUCT_DETAILS_ATTRIBUTE, { body: validInputs });
            redirectTo(res, '/chooseValidity');
        } else if (fareType === 'flatFare') {
            const operatorCookie = unescapeAndDecodeCookie(cookies, OPERATOR_COOKIE);
            const selectedServices = getSessionAttribute(req, SERVICE_LIST_ATTRIBUTE);
            const passengerTypeObject = getSessionAttribute(req, PASSENGER_TYPE_ATTRIBUTE);
            const nocCode = getNocFromIdToken(req, res);

            if (!selectedServices || !passengerTypeObject || !nocCode) {
                throw new Error('Necessary info not found for productDetails API');
            }

            const { operator, uuid } = JSON.parse(operatorCookie);
            const formattedServiceInfo: ServicesInfo[] = selectedServices.map((selectedService: string) => {
                const service = selectedService.split('#');
                return {
                    lineName: service[0],
                    serviceCode: service[1],
                    startDate: service[2],
                    serviceDescription: service[3],
                };
            });

            const email = getAttributeFromIdToken(req, res, 'email');

            if (!email) {
                throw new Error('Could not extract the user email address from their ID token');
            }

            const flatFareProduct: DecisionData = {
                operatorName: operator.operatorPublicName,
                nocCode,
                email,
                uuid,
                type: fareType,
                products: [{ productName: productDetails.productName, productPrice: productDetails.productPrice }],
                selectedServices: formattedServiceInfo,
                ...passengerTypeObject,
            };

            await putStringInS3(
                MATCHING_DATA_BUCKET_NAME,
                `${nocCode}/${fareType}/${uuid}_${Date.now()}.json`,
                JSON.stringify(flatFareProduct),
                'application/json; charset=utf-8',
            );

            redirectTo(res, '/thankyou');
            return;
        }
    } catch (error) {
        const message = 'There was a problem processing the product details.';
        redirectToError(res, message, error);
    }
};
