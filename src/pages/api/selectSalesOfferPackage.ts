import { NextApiResponse } from 'next';
import { redirectTo, redirectToError, getUuidFromCookie } from './apiUtils';
import {
    getSingleTicketJson,
    getReturnTicketJson,
    getPeriodGeoZoneTicketJson,
    getPeriodMultipleServicesTicketJson,
    getFlatFareTicketJson,
    putUserDataInS3,
} from './apiUtils/userData';
import { isSessionValid } from './apiUtils/validator';
import {
    SALES_OFFER_PACKAGES_ATTRIBUTE,
    PERIOD_TYPE_ATTRIBUTE,
    MULTIPLE_PRODUCT_ATTRIBUTE,
    GROUP_SIZE_ATTRIBUTE,
    GROUP_PASSENGER_INFO_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
} from '../../constants';
import { NextApiRequestWithSession, ErrorInfo } from '../../interfaces';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import { isWithErrors } from '../../interfaces/typeGuards';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const fareTypeAttribute = getSessionAttribute(req, FARE_TYPE_ATTRIBUTE);
        const multipleProductAttribute = getSessionAttribute(req, MULTIPLE_PRODUCT_ATTRIBUTE);

        if (!fareTypeAttribute) {
            throw new Error('No fare type session attribute found.');
        }

        const products = multipleProductAttribute ? multipleProductAttribute.products : [];

        if (
            fareTypeAttribute &&
            fareTypeAttribute.fareType !== 'single' &&
            fareTypeAttribute.fareType !== 'return' &&
            fareTypeAttribute.fareType !== 'period' &&
            fareTypeAttribute.fareType !== 'flatFare'
        ) {
            throw new Error('No fare type found to generate user data json.');
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            const errors: ErrorInfo[] = [
                {
                    errorMessage: 'Choose at least one sales offer package from the options',
                    id: 'sales-offer-package-error',
                },
            ];
            updateSessionAttribute(req, SALES_OFFER_PACKAGES_ATTRIBUTE, { errors, selected: req.body });
            redirectTo(res, `/selectSalesOfferPackage`);

            return;
        }

        if (Object.keys(req.body).length < products.length) {
            const errors: ErrorInfo[] = [
                {
                    errorMessage: 'Choose at least one sales offer package for each product',
                    id: 'sales-offer-package-error',
                },
            ];
            updateSessionAttribute(req, SALES_OFFER_PACKAGES_ATTRIBUTE, { errors, selected: req.body });
            redirectTo(res, `/selectSalesOfferPackage`);

            return;
        }

        const uuid = getUuidFromCookie(req, res);

        let userDataJson;

        const fareType = fareTypeAttribute && fareTypeAttribute.fareType;

        if (fareType === 'single') {
            userDataJson = getSingleTicketJson(req, res);
        } else if (fareType === 'return') {
            userDataJson = getReturnTicketJson(req, res);
        } else if (fareType === 'period') {
            const periodTypeAttribute = getSessionAttribute(req, PERIOD_TYPE_ATTRIBUTE);
            const periodType =
                periodTypeAttribute && !isWithErrors(periodTypeAttribute) ? periodTypeAttribute.name : '';

            if (periodType !== 'periodGeoZone' && periodType !== 'periodMultipleServices') {
                throw new Error('No period type found to generate user data json.');
            }

            if (periodType === 'periodGeoZone') {
                userDataJson = await getPeriodGeoZoneTicketJson(req, res);
            } else if (periodType === 'periodMultipleServices') {
                userDataJson = getPeriodMultipleServicesTicketJson(req, res);
            }
        } else if (fareType === 'flatFare') {
            userDataJson = getFlatFareTicketJson(req, res);
        }

        if (userDataJson) {
            const sessionGroup = getSessionAttribute(req, GROUP_PASSENGER_INFO_ATTRIBUTE);
            const groupSize = getSessionAttribute(req, GROUP_SIZE_ATTRIBUTE);
            const group = !!sessionGroup && !!groupSize;

            if (group) {
                const userDataWithGroupJson = {
                    ...userDataJson,
                    groupDefinition: {
                        maxPeople: groupSize?.maxGroupSize,
                        companions: sessionGroup,
                    },
                };

                await putUserDataInS3(userDataWithGroupJson, uuid);
            } else {
                await putUserDataInS3(userDataJson, uuid);
            }

            redirectTo(res, '/thankyou');
        }

        return;
    } catch (error) {
        const message =
            'There was a problem processing the selected sales offer packages from the salesOfferPackage page:';
        redirectToError(res, message, 'api.selectSalesOfferPackage', error);
    }
};
