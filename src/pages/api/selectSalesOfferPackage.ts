import { NextApiResponse } from 'next';
import Cookies from 'cookies';
import {
    redirectTo,
    redirectToError,
    putUserDataInS3,
    getUuidFromCookie,
    getSingleTicketJson,
    getReturnTicketJson,
    getPeriodGeoZoneTicketJson,
    getPeriodMultipleServicesTicketJson,
    getFlatFareTicketJson,
    unescapeAndDecodeCookie,
} from './apiUtils';
import { isSessionValid } from './service/validator';
import { SALES_OFFER_PACKAGES_ATTRIBUTE, FARE_TYPE_COOKIE, PERIOD_TYPE_COOKIE } from '../../constants';
import { NextApiRequestWithSession, SelectSalesOfferPackageWithError } from '../../interfaces';
import { updateSessionAttribute } from '../../utils/sessions';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const cookies = new Cookies(req, res);
        const fareTypeCookie = unescapeAndDecodeCookie(cookies, FARE_TYPE_COOKIE);
        const fareTypeObject = JSON.parse(fareTypeCookie);
        const { fareType } = fareTypeObject;

        if (!req.body || Object.keys(req.body).length === 0) {
            const salesOfferPackagesAttributeError: SelectSalesOfferPackageWithError = {
                errorMessage: 'Choose at least one service from the options',
            };
            updateSessionAttribute(req, SALES_OFFER_PACKAGES_ATTRIBUTE, salesOfferPackagesAttributeError);
            redirectTo(res, `/selectSalesOfferPackage`);
            return;
        }

        const uuid = getUuidFromCookie(req, res);

        let userDataJson;

        if (fareType === 'single') {
            userDataJson = getSingleTicketJson(req, res);
            await putUserDataInS3(userDataJson, uuid);
            redirectTo(res, '/thankyou');
            return;
        }
        if (fareType === 'return') {
            userDataJson = getReturnTicketJson(req, res);
            await putUserDataInS3(userDataJson, uuid);
            redirectTo(res, '/thankyou');
            return;
        }
        if (fareType === 'period') {
            const periodTypeCookie = unescapeAndDecodeCookie(cookies, PERIOD_TYPE_COOKIE);
            const periodTypeObject = JSON.parse(periodTypeCookie);
            const { periodTypeName } = periodTypeObject;

            if (periodTypeName === 'periodGeoZone') {
                userDataJson = getPeriodGeoZoneTicketJson(req, res);
                await putUserDataInS3(await userDataJson, uuid);
                redirectTo(res, '/thankyou');
                return;
            }
            if (periodTypeName === 'periodMultipleServices') {
                userDataJson = getPeriodMultipleServicesTicketJson(req, res);
                await putUserDataInS3(userDataJson, uuid);
                redirectTo(res, '/thankyou');
                return;
            }
        }
        if (fareType === 'flatFare') {
            userDataJson = getFlatFareTicketJson(req, res);
            await putUserDataInS3(userDataJson, uuid);
            redirectTo(res, '/thankyou');
            return;
        }

        throw new Error('No fare/period type found to generate user data json.');
    } catch (error) {
        const message =
            'There was a problem processing the selected sales offer packages from the salesOfferPackage page:';
        redirectToError(res, message, error);
    }
};
