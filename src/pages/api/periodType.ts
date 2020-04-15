import { NextApiRequest, NextApiResponse } from 'next';
import { getDomain, getUuidFromCookie, redirectTo, redirectToError, setCookieOnResponseObject } from './apiUtils';
import { isSessionValid } from './service/validator';
import { PERIOD_TYPE } from '../../constants';

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (req.body.periodType) {
            const { periodType } = req.body;
            const uuid = getUuidFromCookie(req, res);
            const periodTypeObject = { periodTypeName: periodType, uuid };
            setCookieOnResponseObject(getDomain(req), PERIOD_TYPE, JSON.stringify(periodTypeObject), req, res);

            switch (periodType) {
                case 'periodGeoZone':
                    redirectTo(res, '/csvZoneUpload');
                    return;
                case 'periodMultipleServices':
                    redirectTo(res, '/singleOperator?selectAll=false');
                    return;
                case 'periodMultipleOperators':
                    // redirect to page not made yet
                    return;
                default:
                    throw new Error('Type of period we expect was not received.');
            }
        } else {
            const cookieValue = JSON.stringify({
                errorMessage: 'Choose an option regarding your period ticket type',
            });
            setCookieOnResponseObject(getDomain(req), PERIOD_TYPE, cookieValue, req, res);
            redirectTo(res, '/periodType');
        }
    } catch (error) {
        const message = 'There was a problem selecting the type of period ticket:';
        redirectToError(res, message, error);
    }
};
