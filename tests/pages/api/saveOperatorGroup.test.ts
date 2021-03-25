import { SAVE_OPERATOR_GROUP_ATTRIBUTE, MULTIPLE_OPERATOR_ATTRIBUTE } from '../../../src/constants/attributes';
import { getMockRequestAndResponse } from '../../testData/mockData';
import * as sessions from '../../../src/utils/sessions';
import saveOperatorGroup from '../../../src/pages/api/saveOperatorGroup';
import * as auroradb from '../../../src/data/auroradb';

describe('saveOperatorGroup', () => {
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
    const writeHeadMock = jest.fn();
    const insertOperatorGroupSpy = jest.spyOn(auroradb, 'insertOperatorGroup');
    insertOperatorGroupSpy.mockImplementation().mockResolvedValue();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should redirect back to saveOperatorGroup with errors if the user does not select a radio button', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await saveOperatorGroup(req, res);

        expect(updateSessionAttributeSpy).toBeCalledWith(req, SAVE_OPERATOR_GROUP_ATTRIBUTE, [
            { errorMessage: 'Choose one of the options below', id: 'yes-reuse' },
        ]);
        expect(writeHeadMock).toBeCalledWith(302, { Location: '/saveOperatorGroup' });
        expect(insertOperatorGroupSpy).toBeCalledTimes(0);
    });

    it('should redirect back to saveOperatorGroup with errors if the user selects yes but does not provide an operator group name', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { reuseGroup: 'yes' },
            mockWriteHeadFn: writeHeadMock,
        });
        await saveOperatorGroup(req, res);

        expect(updateSessionAttributeSpy).toBeCalledWith(req, SAVE_OPERATOR_GROUP_ATTRIBUTE, [
            { errorMessage: 'Provide a name for the operator group', id: 'operator-group-name-input' },
        ]);
        expect(writeHeadMock).toBeCalledWith(302, { Location: '/saveOperatorGroup' });
        expect(insertOperatorGroupSpy).toBeCalledTimes(0);
    });

    it('should redirect back to saveOperatorGroup with errors if the user selects yes but their given operator group name already exists, and should NOT make an insert query to the DB', async () => {
        const getOperatorGroupByNameAndNocSpy = jest.spyOn(auroradb, 'getOperatorGroupByNameAndNoc');
        getOperatorGroupByNameAndNocSpy.mockImplementation().mockResolvedValue([
            {
                name: 'Best test group',
                operators: [
                    {
                        name: 'Operator one',
                        nocCode: 'OO',
                    },
                ],
            },
        ]);
        const groupNameWithSpaces = '     Best test    group      ';
        const groupName = 'Best test group';
        const { req, res } = getMockRequestAndResponse({
            body: { reuseGroup: 'yes', groupName: groupNameWithSpaces },
            mockWriteHeadFn: writeHeadMock,
        });
        await saveOperatorGroup(req, res);

        expect(updateSessionAttributeSpy).toBeCalledWith(req, SAVE_OPERATOR_GROUP_ATTRIBUTE, [
            {
                errorMessage: `A saved operator group with name ${groupName} already exists, provide a unique name`,
                id: 'operator-group-name-input',
                userInput: groupName,
            },
        ]);
        expect(writeHeadMock).toBeCalledWith(302, { Location: '/saveOperatorGroup' });
        expect(getOperatorGroupByNameAndNocSpy).toBeCalledWith('Best test group', 'TEST');
        expect(insertOperatorGroupSpy).toBeCalledTimes(0);
    });

    it('should insert the users operator group name with the operator list stored in the session and redirect on to multipleOperatorsServiceList', async () => {
        const getOperatorGroupByNameAndNocSpy = jest.spyOn(auroradb, 'getOperatorGroupByNameAndNoc');
        getOperatorGroupByNameAndNocSpy.mockImplementation().mockResolvedValue([]);
        const groupNameWithSpaces = '     Best test    group      ';
        const groupName = 'Best test group';
        const { req, res } = getMockRequestAndResponse({
            body: { reuseGroup: 'yes', groupName: groupNameWithSpaces },
            session: {
                [MULTIPLE_OPERATOR_ATTRIBUTE]: {
                    selectedOperators: [
                        { name: 'Operator one', nocCode: 'OO' },
                        { name: 'Operator two', nocCode: 'OT' },
                        { name: 'Operator supreme', nocCode: 'OS' },
                    ],
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await saveOperatorGroup(req, res);

        expect(updateSessionAttributeSpy).toBeCalledTimes(0);
        expect(writeHeadMock).toBeCalledWith(302, { Location: '/multipleOperatorsServiceList' });
        expect(getOperatorGroupByNameAndNocSpy).toBeCalledWith('Best test group', 'TEST');
        expect(insertOperatorGroupSpy).toBeCalledWith(
            'TEST',
            [
                { name: 'Operator one', nocCode: 'OO' },
                { name: 'Operator two', nocCode: 'OT' },
                { name: 'Operator supreme', nocCode: 'OS' },
            ],
            groupName,
        );
    });

    it('should do nothing but redirect on to multipleOperatorsServiceList if no is selected', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { reuseGroup: 'no' },
            mockWriteHeadFn: writeHeadMock,
        });
        await saveOperatorGroup(req, res);

        expect(updateSessionAttributeSpy).toBeCalledTimes(0);
        expect(writeHeadMock).toBeCalledWith(302, { Location: '/multipleOperatorsServiceList' });
        expect(insertOperatorGroupSpy).toBeCalledTimes(0);
    });
});
