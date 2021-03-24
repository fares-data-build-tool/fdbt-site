import { NextApiResponse } from 'next';
import { getAndValidateNoc, redirectToError, redirectTo } from './apiUtils/index';
import { NextApiRequestWithSession } from '../../interfaces';
import { updateSessionAttribute } from '../../utils/sessions';
import { SAVE_OPERATOR_GROUP_ATTRIBUTE } from '../../constants/attributes';
import { getOperatorGroupByNameAndNoc } from '../../data/auroradb';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        console.log(req.body);
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
            if (!groupName) {
                updateSessionAttribute(req, SAVE_OPERATOR_GROUP_ATTRIBUTE, [
                    { errorMessage: 'Provide a name for the operator group', id: 'operator-group-name-input' },
                ]);
                redirectTo(res, '/saveOperatorGroup');
                return;
            }
            // DATABASE CALL TO CHECK NAME IS UNIQUE
            const noc = getAndValidateNoc(req, res);
            const results = await getOperatorGroupByNameAndNoc(groupName, noc);
            const nameIsNotUnique = results.length >= 1;
            if (nameIsNotUnique) {
                updateSessionAttribute(req, SAVE_OPERATOR_GROUP_ATTRIBUTE, [
                    {
                        errorMessage: `A saved operator group with name ${groupName} already exists, provide a unique name`,
                        id: 'operator-group-name-input',
                        userInput: groupName,
                    },
                ]);
                redirectTo(res, '/saveOperatorGroup');
                return;
            }
            // DATABASE CALL TO ADD GROUP



            
        }
        redirectTo(res, '/multipleOperatorsServiceList');
    } catch (error) {
        const message = 'There was a problem saving the operator group:';
        redirectToError(res, message, 'api.saveOperatorGroup', error);
    }
};
