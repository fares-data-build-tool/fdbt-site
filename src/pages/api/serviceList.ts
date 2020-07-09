import { NextApiResponse } from 'next';
import { isArray } from 'util';
import { updateSessionAttribute, getSessionAttribute } from '../../utils/sessions';
import { NextApiRequestWithSession } from '../../interfaces';
import { redirectTo, redirectToError } from './apiUtils';
import { isSessionValid } from './service/validator';
import { SERVICE_LIST_ATTRIBUTE, FARE_TYPE_ATTRIBUTE } from '../../constants';

interface ServiceList {
    selectedServices: string[];
    error: boolean;
}

const setServiceListAttribute = (
    req: NextApiRequestWithSession,
    error?: boolean,
    checkedServiceList?: string[],
): void => {
    const serviceListObject: ServiceList = { error: false, selectedServices: [] };

    updateSessionAttribute(req, SERVICE_LIST_ATTRIBUTE, {
        ...serviceListObject,
        selectedServices: checkedServiceList,
        error: !!error,
    });
};

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    const redirectUrl = '/serviceList';
    const selectAllText = 'Select All';

    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const { fareType } = getSessionAttribute(req, FARE_TYPE_ATTRIBUTE);
        console.log(fareType);
        if (!fareType) {
            throw new Error('Failed to retrieve FARE_TYPE_ATTRIBUTE info for serviceList API');
        }

        const refererUrl = req?.headers?.referer;
        const queryString = refererUrl?.substring(refererUrl?.indexOf('?') + 1);
        const { selectAll } = req.body;

        const isSelected = selectAll === selectAllText;

        if (selectAll && queryString) {
            setServiceListAttribute(req);
            redirectTo(res, `${redirectUrl}?selectAll=${isSelected}`);
            return;
        }

        if ((!req.body || Object.keys(req.body).length === 0) && !selectAll) {
            updateSessionAttribute(req, SERVICE_LIST_ATTRIBUTE, {
                errorMessage: 'Choose at least one service from the options',
            });
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

        setServiceListAttribute(req, false, checkedServiceList);

        if (fareType.fareType === 'flatFare') {
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
