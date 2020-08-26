import { NextApiResponse } from 'next';
import { setCookieOnResponseObject, redirectToError, redirectTo } from './apiUtils/index';
import { PASSENGER_TYPE_COOKIE, PASSENGER_TYPES_WITH_GROUP, FARE_TYPE_ATTRIBUTE } from '../../constants/index';
import { isSessionValid } from './apiUtils/validator';
import { getSessionAttribute } from '../../utils/sessions';
import { NextApiRequestWithSession } from '../../interfaces';

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
        }

        const fareTypeAttribute = getSessionAttribute(req, FARE_TYPE_ATTRIBUTE);

        if (!fareTypeAttribute) {
            throw new Error('Necessary fare type attribute not found for passenger type page');
        }

        const passengerTypeValues = PASSENGER_TYPES_WITH_GROUP.map(type => type.passengerTypeValue);

        if (req.body.passengerType && passengerTypeValues.includes(req.body.passengerType)) {
            const { passengerType } = req.body;

            const cookieValue = JSON.stringify({
                passengerType,
            });

            setCookieOnResponseObject(PASSENGER_TYPE_COOKIE, cookieValue, req, res);

            if (passengerType === 'anyone') {
                redirectTo(res, '/timeRestrictions');
                return;
            }

            if (passengerType === 'group') {
                redirectTo(res, '/groupSize');
                return;
            }

            redirectTo(res, '/definePassengerType');
            return;
        }

        const passengerTypeCookieValue = JSON.stringify({
            errorMessage: 'Choose a passenger type from the options',
        });
        setCookieOnResponseObject(PASSENGER_TYPE_COOKIE, passengerTypeCookieValue, req, res);
        redirectTo(res, '/passengerType');
    } catch (error) {
        const message = 'There was a problem selecting the passenger type:';
        redirectToError(res, message, 'api.passengerType', error);
    }
};
