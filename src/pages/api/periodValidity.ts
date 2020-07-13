import { NextApiResponse } from 'next';
import Cookies from 'cookies';
import { NextApiRequestWithSession, ServicesInfo, PassengerDetails } from '../../interfaces';
import { getSessionAttribute } from '../../utils/sessions';
import {
    OPERATOR_COOKIE,
    PRODUCT_DETAILS_ATTRIBUTE,
    PERIOD_EXPIRY_ATTRIBUTE,
    MATCHING_DATA_BUCKET_NAME,
    CSV_ZONE_UPLOAD_ATTRIBUTE,
    DAYS_VALID_COOKIE,
    SERVICE_LIST_ATTRIBUTE,
    PERIOD_TYPE_ATTRIBUTE,
    PASSENGER_TYPE_ATTRIBUTE,
} from '../../constants';
import {
    setCookieOnResponseObject,
    redirectToError,
    redirectTo,
    unescapeAndDecodeCookie,
    getNocFromIdToken,
    getAttributeFromIdToken,
} from './apiUtils';
import { batchGetStopsByAtcoCode, Stop } from '../../data/auroradb';
import { getCsvZoneUploadData, putStringInS3 } from '../../data/s3';
import { isSessionValid } from './service/validator';

interface Product {
    productName: string;
    productPrice: string;
    productDuration?: string;
    productValidity?: string;
}

export interface DecisionData extends PassengerDetails {
    operatorName: string;
    type: string;
    nocCode: string;
    products: Product[];
    selectedServices?: ServicesInfo[];
    zoneName?: string;
    stops?: Stop[];
    email: string;
    uuid: string;
}

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (req.body.periodValid) {
            const { periodValid } = req.body;

            const cookies = new Cookies(req, res);

            const productDetails = getSessionAttribute(req, PRODUCT_DETAILS_ATTRIBUTE);
            const daysValidCookie = unescapeAndDecodeCookie(cookies, DAYS_VALID_COOKIE);
            const operatorCookie = unescapeAndDecodeCookie(cookies, OPERATOR_COOKIE);
            const fareZoneName = getSessionAttribute(req, CSV_ZONE_UPLOAD_ATTRIBUTE);
            const serviceListCookie = unescapeAndDecodeCookie(cookies, SERVICE_LIST_ATTRIBUTE);
            const periodTypeName = getSessionAttribute(req, PERIOD_TYPE_ATTRIBUTE);
            const passengerTypeObject = getSessionAttribute(req, PASSENGER_TYPE_ATTRIBUTE);
            const nocCode = getNocFromIdToken(req, res);

            if (
                !nocCode ||
                productDetails === '' ||
                daysValidCookie === '' ||
                !passengerTypeObject ||
                (operatorCookie === '' && (!fareZoneName || serviceListCookie))
            ) {
                throw new Error('Necessary cookies not found for period validity API');
            }

            let props = {};
            const { productName, productPrice } = productDetails;
            const { daysValid } = JSON.parse(daysValidCookie);
            const { operator, uuid } = JSON.parse(operatorCookie);

            if (fareZoneName) {
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

            if (serviceListCookie) {
                const { selectedServices } = JSON.parse(serviceListCookie);
                const formattedServiceInfo: ServicesInfo[] = selectedServices.map((selectedService: string) => {
                    const service = selectedService.split('#');
                    return {
                        lineName: service[0],
                        serviceCode: service[1],
                        startDate: service[2],
                        serviceDescription: service[3],
                    };
                });
                props = {
                    selectedServices: formattedServiceInfo,
                };
            }

            setCookieOnResponseObject(PERIOD_EXPIRY_ATTRIBUTE, JSON.stringify({ periodValid, error: false }), req, res);

            const email = getAttributeFromIdToken(req, res, 'email');

            if (!email) {
                throw new Error('Could not extract the user email address from their ID token');
            }

            const period: DecisionData = {
                operatorName: operator.operatorPublicName,
                type: periodTypeName,
                nocCode,
                email,
                uuid,
                products: [
                    {
                        productName,
                        productPrice,
                        productDuration: daysValid,
                        productValidity: periodValid,
                    },
                ],
                ...passengerTypeObject,
                ...props,
            };

            await putStringInS3(
                MATCHING_DATA_BUCKET_NAME,
                `${nocCode}/${periodTypeName}/${uuid}_${Date.now()}.json`,
                JSON.stringify(period),
                'application/json; charset=utf-8',
            );

            redirectTo(res, '/thankyou');
        } else {
            const cookieValue = JSON.stringify({
                errorMessage: 'Choose an option regarding your period ticket validity',
            });
            setCookieOnResponseObject(PERIOD_EXPIRY_ATTRIBUTE, cookieValue, req, res);
            redirectTo(res, '/periodValidity');
        }
    } catch (error) {
        const message = 'There was a problem selecting the period validity:';
        redirectToError(res, message, error);
    }
};
