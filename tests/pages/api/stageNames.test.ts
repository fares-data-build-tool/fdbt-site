import * as sessions from '../../../src/utils/sessions';
import { STAGE_NAMES_ATTRIBUTE } from '../../../src/constants';
import stageNames, { isStageNameValid } from '../../../src/pages/api/stageNames';
import { getMockRequestAndResponse } from '../../testData/mockData';

describe('stageNames', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('isStageNameValid', () => {
        it('should return an array of invalid input checks when the user enters no data', () => {
            const mockBody = { stageNameInput: ['', '', '', ''] };
            const { req } = getMockRequestAndResponse({ cookieValues: {}, body: mockBody });
            const expectedArray = [
                { error: 'Enter a name for this fare stage', id: 'fare-stage-name-1-error', inputValue: '' },
                { error: 'Enter a name for this fare stage', id: 'fare-stage-name-2-error', inputValue: '' },
                { error: 'Enter a name for this fare stage', id: 'fare-stage-name-3-error', inputValue: '' },
                { error: 'Enter a name for this fare stage', id: 'fare-stage-name-4-error', inputValue: '' },
            ];
            const inputCheck = isStageNameValid(req);
            expect(inputCheck).toEqual(expectedArray);
        });
        it('should return an array of valid input checks when the user enters correct data', () => {
            const mockBody = { stageNameInput: ['abcd', 'efg', 'hijkl', 'mn'] };
            const { req } = getMockRequestAndResponse({ cookieValues: {}, body: mockBody });
            const expectedArray = [
                { error: '', id: 'fare-stage-name-1-error', inputValue: 'abcd' },
                { error: '', id: 'fare-stage-name-2-error', inputValue: 'efg' },
                { error: '', id: 'fare-stage-name-3-error', inputValue: 'hijkl' },
                { error: '', id: 'fare-stage-name-4-error', inputValue: 'mn' },
            ];
            const inputCheck = isStageNameValid(req);
            expect(inputCheck).toEqual(expectedArray);
        });
        it('should return an array of invalid and valid input checks when the user enters incorrect data', () => {
            const mockBody = { stageNameInput: ['abcde', '   ', 'xyz', '', 'gggg', 'gggg'] };
            const { req } = getMockRequestAndResponse({ cookieValues: {}, body: mockBody });
            const expectedArray = [
                { error: '', id: 'fare-stage-name-1-error', inputValue: 'abcde' },
                { error: 'Enter a name for this fare stage', id: 'fare-stage-name-2-error', inputValue: '   ' },
                { error: '', id: 'fare-stage-name-3-error', inputValue: 'xyz' },
                { error: 'Enter a name for this fare stage', id: 'fare-stage-name-4-error', inputValue: '' },
                { error: 'Stage names cannot share exact names', id: 'fare-stage-name-5-error', inputValue: 'gggg' },
                { error: 'Stage names cannot share exact names', id: 'fare-stage-name-6-error', inputValue: 'gggg' },
            ];
            const inputCheck = isStageNameValid(req);
            expect(inputCheck).toEqual(expectedArray);
        });
        it('should return an array of invalid and valid input checks when the user enters correct data but with duplicates', () => {
            const mockBody = { stageNameInput: ['abc', 'abc', 'a', 'b'] };
            const { req } = getMockRequestAndResponse({ cookieValues: {}, body: mockBody });
            const expectedArray = [
                { error: 'Stage names cannot share exact names', id: 'fare-stage-name-1-error', inputValue: 'abc' },
                { error: 'Stage names cannot share exact names', id: 'fare-stage-name-2-error', inputValue: 'abc' },
                { error: '', id: 'fare-stage-name-3-error', inputValue: 'a' },
                { error: '', id: 'fare-stage-name-4-error', inputValue: 'b' },
            ];
            const inputCheck = isStageNameValid(req);
            expect(inputCheck).toEqual(expectedArray);
        });
    });

    it('should return 302 redirect to /stageNames (i.e. itself) when the session is valid, but there is no request body', () => {
        const mockBody = { stageNameInput: ['', '', '', ''] };
        const mockWriteHeadFn = jest.fn();
        const { req, res } = getMockRequestAndResponse({ cookieValues: {}, body: mockBody, uuid: {}, mockWriteHeadFn });
        stageNames(req, res);
        expect(mockWriteHeadFn).toBeCalledWith(302, {
            Location: '/stageNames',
        });
    });

    it('should return 302 redirect to /priceEntry when session is valid and request body is present', () => {
        const mockBody = { stageNameInput: ['a', 'b', 'c', 'd'] };
        const mockWriteHeadFn = jest.fn();
        const { req, res } = getMockRequestAndResponse({ cookieValues: {}, body: mockBody, uuid: {}, mockWriteHeadFn });
        stageNames(req, res);
        expect(mockWriteHeadFn).toBeCalledWith(302, {
            Location: '/priceEntry',
        });
    });

    it('should set the STAGE_NAMES_ATTRIBUTE with values matching the valid data entered by the user ', () => {
        const setUpdateSessionspy = jest.spyOn(sessions, 'updateSessionAttribute');
        const mockBody = { stageNameInput: ['a', 'b', 'c', 'd'] };
        const { req, res } = getMockRequestAndResponse({ cookieValues: {}, body: mockBody });
        const mockStageNamesCookieValue = ['a', 'b', 'c', 'd'];
        stageNames(req, res);
        expect(setUpdateSessionspy).toHaveBeenCalledWith(req, STAGE_NAMES_ATTRIBUTE, mockStageNamesCookieValue);
    });

    it('should set the STAGE_NAMES_ATTRIBUTE with a value matching the invalid data entered by the user', () => {
        const setUpdateSessionspy = jest.spyOn(sessions, 'updateSessionAttribute');
        const mockBody = { stageNameInput: [' ', 'abcdefghijklmnopqrstuvwxyzabcdefgh', '   ', 'b'] };
        const { req, res } = getMockRequestAndResponse({ cookieValues: {}, body: mockBody });
        const mockInputCheck = [
            { inputValue: ' ', error: 'Enter a name for this fare stage', id: 'fare-stage-name-1-error' },
            {
                inputValue: 'abcdefghijklmnopqrstuvwxyzabcdefgh',
                error: 'The name for Fare Stage 2 needs to be less than 30 characters',
                id: 'fare-stage-name-2-error',
            },
            { inputValue: '   ', error: 'Enter a name for this fare stage', id: 'fare-stage-name-3-error' },
            { inputValue: 'b', error: '', id: 'fare-stage-name-4-error' },
        ];
        stageNames(req, res);
        expect(setUpdateSessionspy).toBeCalledWith(req, STAGE_NAMES_ATTRIBUTE, mockInputCheck);
    });
});
