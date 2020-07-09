import { NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { NextRequestWithSession } from '../../interfaces';
import { OPERATOR_COOKIE } from '../../constants/index';
import { redirectToError, redirectTo, setCookieOnResponseObject } from './apiUtils';

export default (req: NextRequestWithSession, res: NextApiResponse): void => {
    try {
        if (req.body.operator) {
            const { operatorName, nocCode } = JSON.parse(req.body.operator);
            const uuid = uuidv4();
            const cookieValue = JSON.stringify({ operator: operatorName, uuid, nocCode });

            console.info('transaction start', { uuid });

            setCookieOnResponseObject(req, res, OPERATOR_COOKIE, cookieValue);
            redirectTo(res, '/fareType');
        } else {
            const cookieValue = JSON.stringify({ errorMessage: 'Choose an operator from the options' });
            setCookieOnResponseObject(req, res, OPERATOR_COOKIE, cookieValue);
            redirectTo(res, '/operator');
        }
    } catch (error) {
        const message = 'There was a problem selecting the operator:';
        redirectToError(res, message, error);
    }
};
