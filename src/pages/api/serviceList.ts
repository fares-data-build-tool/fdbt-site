import { NextApiRequest, NextApiResponse } from 'next';
import { isArray } from 'util';
import { redirectTo, redirectToError, getSessionAttributes, updateSessionAttribute } from './apiUtils';
import { isSessionValid } from './service/validator';
import { SERVICE_LIST_COOKIE, FARE_TYPE_COOKIE } from '../../constants';

interface ServiceList {
    selectedServices: string[];
    error: boolean;
}

const setServiceListSessionAttribute = (req: NextApiRequest, error?: boolean, checkedServiceList?: string[]): void => {
    const serviceListObject: ServiceList = { error: false, selectedServices: [] };
    const serviceListValue = { ...serviceListObject, selectedServices: checkedServiceList, error: !!error };
    updateSessionAttribute(SERVICE_LIST_COOKIE, serviceListValue, req);
};

export default (req: NextApiRequest, res: NextApiResponse): void => {
    const redirectUrl = '/serviceList';
    const selectAllText = 'Select All';

    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const fareTypeObject = getSessionAttributes([FARE_TYPE_COOKIE], req);

        if (!fareTypeObject || !fareTypeObject.fareType) {
            throw new Error('Failed to retrieve FARE_TYPE_COOKIE info for serviceList API');
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
            updateSessionAttribute(SERVICE_LIST_COOKIE, errorValue, req);
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
