import { NextApiResponse } from 'next';
import {
    PERIOD_TYPE_ATTRIBUTE,
    GROUP_SIZE_ATTRIBUTE,
    GROUP_PASSENGER_INFO_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
} from '../../constants/index';
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
import { NextApiRequestWithSession } from '../../interfaces';
import { getSessionAttribute } from '../../utils/sessions';
import { isFareType, isPeriodType } from '../../interfaces/typeGuards';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const fareTypeAttribute = getSessionAttribute(req, FARE_TYPE_ATTRIBUTE);

        if (!fareTypeAttribute) {
            throw new Error('No fare type session attribute found.');
        }

        if (
            isFareType(fareTypeAttribute) &&
            fareTypeAttribute.fareType !== 'single' &&
            fareTypeAttribute.fareType !== 'return' &&
            fareTypeAttribute.fareType !== 'period' &&
            fareTypeAttribute.fareType !== 'flatFare'
        ) {
            throw new Error('No fare type found to generate user data json.');
        }

        const uuid = getUuidFromCookie(req, res);

        let userDataJson;

        const fareType = isFareType(fareTypeAttribute) && fareTypeAttribute.fareType;

        if (fareType === 'single') {
            userDataJson = getSingleTicketJson(req, res);
        } else if (fareType === 'return') {
            userDataJson = getReturnTicketJson(req, res);
        } else if (fareType === 'period') {
            const periodTypeAttribute = getSessionAttribute(req, PERIOD_TYPE_ATTRIBUTE);
            const periodType = isPeriodType(periodTypeAttribute) ? periodTypeAttribute.name : '';

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
        const message = 'There was a problem processing the information needed for the user data to be put in s3:';
        redirectToError(res, message, 'api.selectSalesOfferPackage', error);
    }
};