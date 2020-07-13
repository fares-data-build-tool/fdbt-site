import { NextApiResponse } from 'next';
import { NextApiRequestWithSession } from '../../interfaces';
import { redirectTo, redirectToError } from './apiUtils';
import { isSessionValid } from './service/validator';
import { PERIOD_TYPE_ATTRIBUTE } from '../../constants';
import { updateSessionAttribute } from '../../utils/sessions';

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        if (req.body.periodType) {
            updateSessionAttribute(req, PERIOD_TYPE_ATTRIBUTE, {
                body: { errorMessage: '', periodType: req.body.periodType },
            });

            switch (req.body.periodType) {
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
            updateSessionAttribute(req, PERIOD_TYPE_ATTRIBUTE, {
                body: { errorMessage: 'Choose an option regarding your period ticket type' },
            });
            redirectTo(res, '/periodType');
        }
    } catch (error) {
        const message = 'There was a problem selecting the type of period ticket:';
        redirectToError(res, message, error);
    }
};
