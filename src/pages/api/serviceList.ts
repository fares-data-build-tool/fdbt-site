import { NextApiResponse } from 'next';
import { isArray } from 'util';
import { NextRequestWithSession } from '../../interfaces';
import { getSessionAttributes, updateSessionAttribute } from '../../utils/sessions';
import { redirectTo, redirectToError } from './apiUtils';
import { isSessionValid } from './service/validator';
import { SERVICE_LIST_ATTRIBUTE, FARE_TYPE_ATTRIBUTE } from '../../constants';

interface ServiceList {
    selectedServices: string[];
    error: boolean;
}

const setServiceListSessionAttribute = (
    req: NextRequestWithSession,
    error?: boolean,
    checkedServiceList?: string[],
): void => {
    const serviceListObject: ServiceList = { error: false, selectedServices: [] };
    const serviceListValue = { ...serviceListObject, selectedServices: checkedServiceList, error: !!error };
    updateSessionAttribute(req, SERVICE_LIST_ATTRIBUTE, serviceListValue);
};

export default (req: NextRequestWithSession, res: NextApiResponse): void => {
    const redirectUrl = '/serviceList';
    const selectAllText = 'Select All';

    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const fareTypeObject = getSessionAttributes(req, [FARE_TYPE_ATTRIBUTE]);

        if (!fareTypeObject || !fareTypeObject.fareType) {
            throw new Error('Failed to retrieve FARE_TYPE_ATTRIBUTE info for serviceList API');
        }

        const refererUrl = req?.headers?.referer;
        const queryString = refererUrl?.substring(refererUrl?.indexOf('?') + 1);
        const { selectAll } = req.body;

        const isSelected = selectAll === selectAllText;

        if (selectAll && queryString) {
            setServiceListSessionAttribute(req);
            redirectTo(res, `${redirectUrl}?selectAll=${isSelected}`);
            return;
        }

        if ((!req.body || Object.keys(req.body).length === 0) && !selectAll) {
            const errorValue = {
                errorMessage: 'Choose at least one service from the options',
            };
            updateSessionAttribute(req, SERVICE_LIST_ATTRIBUTE, errorValue);
            redirectTo(res, `${redirectUrl}?selectAll=false`);
            return;
        }

        const checkedServiceList: string[] = [];

        const requestBody: { [key: string]: string | string[] } = req.body;

        Object.entries(requestBody).forEach(entry => {
            const lineNameServiceCodeStartDate = entry[0];
            const description = entry[1];
            let serviceDescription: string;
            if (isArray(description)) {
                [serviceDescription] = description;
            } else {
                serviceDescription = description;
            }
            const data = `${lineNameServiceCodeStartDate}#${serviceDescription}`;
            checkedServiceList.push(data);
        });

        setServiceListSessionAttribute(req, false, checkedServiceList);

        if (fareTypeObject.fareType === 'flatFare') {
            redirectTo(res, '/productDetails');
            return;
        }

        redirectTo(res, '/howManyProducts');
        return;
    } catch (error) {
        const message = 'There was a problem processing the selected services from the servicesList page:';
        redirectToError(res, message, error);
    }
};
