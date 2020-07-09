import { NextApiResponse } from 'next';
import { NextRequestWithSession } from '../../interfaces';
import { getUuidFromCookie } from '../../utils';
import { redirectTo, redirectToError, setCookieOnResponseObject } from './apiUtils';
import { isSessionValid } from './service/validator';
import { PERIOD_TYPE_ATTRIBUTE } from '../../constants';

export default (req: NextRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (req.body.periodType) {
            const { periodType } = req.body;
            const uuid = getUuidFromCookie(req, res);
            const periodTypeObject = { periodTypeName: periodType, uuid };
            setCookieOnResponseObject(req, res, PERIOD_TYPE_ATTRIBUTE, JSON.stringify(periodTypeObject));

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
            setCookieOnResponseObject(req, res, PERIOD_TYPE_ATTRIBUTE, cookieValue);
            redirectTo(res, '/periodType');
        }
    } catch (error) {
        const message = 'There was a problem selecting the type of period ticket:';
        redirectToError(res, message, error);
    }
};
