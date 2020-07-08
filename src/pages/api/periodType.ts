import { NextApiRequest, NextApiResponse } from 'next';
import { getUuidFromCookie, redirectTo, redirectToError, setCookieOnResponseObject } from './apiUtils';
import { isSessionValid } from './service/validator';
import { PERIOD_TYPE_COOKIE } from '../../constants';

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (req.body.periodType) {
            const { periodType } = req.body;
            const uuid = getUuidFromCookie(req, res);
            const periodTypeObject = { periodTypeName: periodType, uuid };
            setCookieOnResponseObject(req, res, PERIOD_TYPE_COOKIE, JSON.stringify(periodTypeObject));

            switch (periodType) {
                case 'periodGeoZone':
                    redirectTo(res, '/csvZoneUpload');
                    return;
                case 'periodMultipleServices':
                    redirectTo(res, '/serviceList?selectAll=false');
                    return;
                case 'periodMultipleOperators':
                    return;
                default:
                    throw new Error('Type of period we expect was not received.');
            }
        } else {
            const cookieValue = JSON.stringify({
                errorMessage: 'Choose an option regarding your period ticket type',
            });
            setCookieOnResponseObject(req, res, PERIOD_TYPE_COOKIE, cookieValue);
            redirectTo(res, '/periodType');
        }
    } catch (error) {
        const message = 'There was a problem selecting the type of period ticket:';
        redirectToError(res, message, error);
    }
};
