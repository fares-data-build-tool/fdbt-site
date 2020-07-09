import { getMockRequestAndResponse } from '../testData/mockData';
import {
    updateSessionAttribute,
    // getSessionAttribute,
    // overwriteSession,
    // destroySession,
} from '../../src/utils/sessions';

describe('sessions', () => {
    describe('updateSessionAttribute', () => {
        it('should update a session attribute', () => {
            const { req } = getMockRequestAndResponse();
            const attributeName = 'fdbt-session';
            const attributeValue = { 'session-active': true };
            updateSessionAttribute(req, attributeName, attributeValue);
            expect(req.session).toEqual({ 'fdbt-session': attributeValue });
        });
    });
});
