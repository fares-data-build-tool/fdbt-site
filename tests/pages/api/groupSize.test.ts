import groupSize from '../../../src/pages/api/groupSize';
import { getMockRequestAndResponse } from '../../testData/mockData';

describe('groupSize', () => {
    it('should do something', () => {
        const { req, res } = getMockRequestAndResponse();
        groupSize(req, res);
        expect(true).toBe(true);
    });
});
