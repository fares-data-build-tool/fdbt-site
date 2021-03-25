import { NextApiResponse } from 'next';
import { getAndValidateNoc, redirectTo, redirectToError } from './apiUtils/index';
import { getOperatorGroupsByNameAndNoc } from '../../data/auroradb';
import { MULTIPLE_OPERATOR_ATTRIBUTE, REUSE_OPERATOR_GROUP_ATTRIBUTE } from '../../constants/attributes';
import { NextApiRequestWithSession } from '../../interfaces';
import { updateSessionAttribute } from '../../utils/sessions';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const { reuseGroupChoice, premadeOperatorGroup } = req.body;
        if (!reuseGroupChoice) {
            updateSessionAttribute(req, REUSE_OPERATOR_GROUP_ATTRIBUTE, [
                { errorMessage: 'Choose one of the options below', id: 'conditional-form-group' },
            ]);
            redirectTo(res, '/reuseOperatorGroup');
            return;
        }

        if (reuseGroupChoice === 'No') {
            redirectTo(res, '/searchOperators');
            return;
        }
        if (!premadeOperatorGroup) {
            updateSessionAttribute(req, REUSE_OPERATOR_GROUP_ATTRIBUTE, [
                { errorMessage: 'Choose a premade operator group from the options below', id: 'premadeOperatorGroup' },
            ]);
            redirectTo(res, '/reuseOperatorGroup');
            return;
        }
        const noc = getAndValidateNoc(req, res);
        const selectedOperators = (await getOperatorGroupsByNameAndNoc(premadeOperatorGroup, noc))[0].operators;

        updateSessionAttribute(req, MULTIPLE_OPERATOR_ATTRIBUTE, { selectedOperators });
        updateSessionAttribute(req, REUSE_OPERATOR_GROUP_ATTRIBUTE, []);

        redirectTo(res, '/multipleOperatorsServiceList');
        return;
    } catch (error) {
        const message = 'There was a problem with the user selecting their premade operator group:';
        redirectToError(res, message, 'api.reuseOperatorGroup', error);
    }
};
