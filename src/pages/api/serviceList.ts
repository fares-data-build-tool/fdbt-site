import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import {
    getDomain,
    getUuidFromCookie,
    redirectTo,
    redirectToError,
    setCookieOnResponseObject,
    unescapeAndDecodeCookie,
} from './apiUtils';
import { isSessionValid } from './service/validator';
import { SERVICE_LIST_COOKIE, FARETYPE_COOKIE } from '../../constants';
import { ServiceLists, ServicesInfo } from '../../interfaces';

const redirectUrl = '/serviceList';
const selectAllText = 'Select All';
const serviceListObject: ServiceLists = { error: false, selectedServices: [] };

const setServiceListCookie = (
    req: NextApiRequest,
    res: NextApiResponse,
    error?: boolean,
    checkServiceList?: ServicesInfo[],
): void => {
    const uuid = getUuidFromCookie(req, res);

    setCookieOnResponseObject(
        getDomain(req),
        SERVICE_LIST_COOKIE,
        JSON.stringify({ ...serviceListObject, selectedServices: checkServiceList, error: !!error, uuid }),
        req,
        res,
    );
};

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const cookies = new Cookies(req, res);
        const fareTypeCookie = unescapeAndDecodeCookie(cookies, FARETYPE_COOKIE);
        const fareTypeObject = JSON.parse(fareTypeCookie);

        if (!fareTypeObject || !fareTypeObject.fareType) {
            throw new Error('Failed to retrieve FARE_TYPE_COOKIE info for serviceList API');
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
            setServiceListCookie(req, res, true);
            redirectTo(res, `${redirectUrl}?selectAll=false`);
            return;
        }

        const checkedServiceList: ServicesInfo[] = [];

        const requestBody: { [key: string]: string } = req.body;

        Object.entries(requestBody).forEach(entry => {
            console.log(entry);
            const checkedBoxValues = entry[1].split('/');
            const data: ServicesInfo = {
                lineName: entry[0],
                startDate: checkedBoxValues[1],
                serviceDescription: checkedBoxValues[0],
            };
            checkedServiceList.push(data);
        });

        setServiceListCookie(req, res, false, checkedServiceList);

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
