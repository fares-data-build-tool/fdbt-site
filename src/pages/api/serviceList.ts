import { NextApiRequest, NextApiResponse } from 'next';
import { isArray } from 'util';
import { redirectTo, redirectToError, setCookieOnResponseObject } from './apiUtils';
import { isSessionValid } from './apiUtils/validator';
import { SERVICE_LIST_COOKIE, FARE_TYPE_ATTRIBUTE } from '../../constants';
import { getSessionAttribute } from '../../utils/sessions';
import { isFareType } from './apiUtils/typeChecking';
import { NextApiRequestWithSession } from '../../interfaces';

interface ServiceList {
    selectedServices: string[];
    error: boolean;
}

const setServiceListCookie = (
    req: NextApiRequest,
    res: NextApiResponse,
    error?: boolean,
    checkedServiceList?: string[],
): void => {
    const serviceListObject: ServiceList = { error: false, selectedServices: [] };

    setCookieOnResponseObject(
        SERVICE_LIST_COOKIE,
        JSON.stringify({ ...serviceListObject, selectedServices: checkedServiceList, error: !!error }),
        req,
        res,
    );
};

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    const redirectUrl = '/serviceList';
    const selectAllText = 'Select All';

    try {
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
        }

        const fareTypeAttribute = getSessionAttribute(req, FARE_TYPE_ATTRIBUTE);

        if (isFareType(fareTypeAttribute) && !fareTypeAttribute.fareType) {
            throw new Error('Failed to retrieve fare type attribute info for serviceList API');
        }

        const refererUrl = req?.headers?.referer;
        const queryString = refererUrl?.substring(refererUrl?.indexOf('?') + 1);
        const { selectAll } = req.body;

        const isSelected = selectAll === selectAllText;

        if (selectAll && queryString) {
            setServiceListCookie(req, res);
            redirectTo(res, `${redirectUrl}?selectAll=${isSelected}`);
            return;
        }

        if ((!req.body || Object.keys(req.body).length === 0) && !selectAll) {
            const cookieValue = JSON.stringify({ errorMessage: 'Choose at least one service from the options' });
            setCookieOnResponseObject(SERVICE_LIST_COOKIE, cookieValue, req, res);
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

        setServiceListCookie(req, res, false, checkedServiceList);

        if (isFareType(fareTypeAttribute) && fareTypeAttribute.fareType === 'flatFare') {
            redirectTo(res, '/productDetails');
            return;
        }

        redirectTo(res, '/howManyProducts');
        return;
    } catch (error) {
        const message = 'There was a problem processing the selected services from the servicesList page:';
        redirectToError(res, message, 'api.serviceList', error);
    }
};
