import { NextApiResponse } from 'next';
import { getAndValidateNoc, redirectToError, redirectTo } from './apiUtils/index';
import { NextApiRequestWithSession, MultipleOperatorsAttribute } from '../../interfaces';
import { updateSessionAttribute, getSessionAttribute } from '../../utils/sessions';
import { SAVE_OPERATOR_GROUP_ATTRIBUTE, MULTIPLE_OPERATOR_ATTRIBUTE } from '../../constants/attributes';
import { getOperatorGroupByNameAndNoc, insertOperatorGroup } from '../../data/auroradb';
import { removeExcessWhiteSpace } from './apiUtils/validator';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const { reuseGroup } = req.body;
        if (!reuseGroup) {
            updateSessionAttribute(req, SAVE_OPERATOR_GROUP_ATTRIBUTE, [
                { errorMessage: 'Choose one of the options below', id: 'yes-reuse' },
            ]);
            redirectTo(res, '/saveOperatorGroup');
            return;
        }
        if (reuseGroup === 'yes') {
            const { groupName } = req.body;
            const refinedGroupName = removeExcessWhiteSpace(groupName);
            if (!refinedGroupName) {
                updateSessionAttribute(req, SAVE_OPERATOR_GROUP_ATTRIBUTE, [
                    { errorMessage: 'Provide a name for the operator group', id: 'operator-group-name-input' },
                ]);
                redirectTo(res, '/saveOperatorGroup');
                return;
            }
            const noc = getAndValidateNoc(req, res);
            const results = await getOperatorGroupByNameAndNoc(refinedGroupName, noc);
            const nameIsNotUnique = results.length >= 1;
            if (nameIsNotUnique) {
                updateSessionAttribute(req, SAVE_OPERATOR_GROUP_ATTRIBUTE, [
                    {
                        errorMessage: `A saved operator group with name ${refinedGroupName} already exists, provide a unique name`,
                        id: 'operator-group-name-input',
                        userInput: refinedGroupName,
                    },
                ]);
                redirectTo(res, '/saveOperatorGroup');
                return;
            }
            const operators = (getSessionAttribute(req, MULTIPLE_OPERATOR_ATTRIBUTE) as MultipleOperatorsAttribute)
                .selectedOperators;
            await insertOperatorGroup(noc, operators, refinedGroupName);
        }
        redirectTo(res, '/multipleOperatorsServiceList');
    } catch (error) {
        const message = 'There was a problem saving the operator group:';
        redirectToError(res, message, 'api.saveOperatorGroup', error);
    }
};
