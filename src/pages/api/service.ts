import { NextApiResponse } from 'next';
import { getUuidFromCookie, redirectToError, redirectTo } from './apiUtils/index';
import { FARE_TYPE_ATTRIBUTE, SERVICE_ATTRIBUTE } from '../../constants/index';
import { isSessionValid } from './service/validator';
import { updateSessionAttribute, getSessionAttribute } from '../../utils/sessions';
import { NextApiRequestWithSession } from '../../interfaces';

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }
        const { service } = req.body;

        if (!service) {
            updateSessionAttribute(req, SERVICE_ATTRIBUTE, {
                body: { errorMessage: 'Choose a service from the options' },
            });
            redirectTo(res, '/service');
            return;
        }
        console.log('*****HERE*******');
        const uuid = getUuidFromCookie(req, res);

        if (!uuid) {
            throw new Error('No UUID found');
        }

        updateSessionAttribute(req, SERVICE_ATTRIBUTE, {
            body: { service, uuid },
        });

        const { fareType } = getSessionAttribute(req, FARE_TYPE_ATTRIBUTE);

        if (fareType && fareType === 'return') {
            redirectTo(res, '/returnDirection');
            return;
        }

        redirectTo(res, '/singleDirection');
    } catch (error) {
        const message = 'There was a problem selecting the service:';
        redirectToError(res, message, error);
    }
};
