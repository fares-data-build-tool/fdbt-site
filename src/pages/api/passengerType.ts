import { NextApiRequest, NextApiResponse } from 'next';
import { getDomain, setCookieOnResponseObject, redirectToError, redirectTo, getUuidFromCookie } from './apiUtils/index';
import { PASSENGERTYPE_COOKIE } from '../../constants/index';

import { isSessionValid } from './service/validator';

export default (req: NextApiRequest, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (req.body.passengerType) {
            const cookieValue = JSON.stringify({
                errorMessage: '',
                uuid: getUuidFromCookie(req, res),
                passengerType: req.body.passengerType,
            });

            setCookieOnResponseObject(getDomain(req), PASSENGERTYPE_COOKIE, cookieValue, req, res);

            const passengerType = JSON.parse(req.body.passengerType);
            const fareType = JSON.parse(req.body.fareType);

            if (
                passengerType === 'adult' ||
                passengerType === 'child' ||
                passengerType === 'infant' ||
                passengerType === 'senior' ||
                passengerType === 'schoolPupil' ||
                passengerType === 'student' ||
                passengerType === 'youngPerson' ||
                passengerType === 'disabled' ||
                passengerType === 'disabledCompanion' ||
                passengerType === 'employee' ||
                passengerType === 'miltary' ||
                passengerType === 'jobSeeker' ||
                passengerType === 'guideDog' ||
                passengerType === ' animal'
            ) {
                redirectTo(res, '/definePassengerType');
                return;
            }
            if (passengerType === 'any') {
                if (fareType === 'single') {
                    redirectTo(res, '/service');
                    return;
                }
                if (fareType === 'period') {
                    redirectTo(res, '/periodType');
                    return;
                }
                if (fareType === 'return') {
                    redirectTo(res, '/service');
                    return;
                }
                if (fareType === 'flatFare') {
                    redirectTo(res, '/serviceList');
                    return;
                }
            }
        } else {
            const cookieValue = JSON.stringify({
                errorMessage: 'Choose a passenger type from the options',
                uuid: getUuidFromCookie(req, res),
            });
            setCookieOnResponseObject(getDomain(req), PASSENGERTYPE_COOKIE, cookieValue, req, res);
            redirectTo(res, '/fareType');
        }
    } catch (error) {
        const message = 'There was a problem selecting the passenger type:';
        redirectToError(res, message, error);
    }
};
