import { passengerTypeDetailsSchema } from '../../../src/pages/api/definePassengerType';

describe('passengerTypeDetailsSchema', () => {
    it.each([
        [{}, false],
        [{ ageRange: 'no', proof: 'no' }, true],
        [{ ageRange: 'no', proof: 'yes', proofDocument: ['Membership Card', 'Student Card'] }, true],
        [{ ageRange: 'yes', proof: 'no' }, false],
        [{ ageRange: 'yes', ageRangeMin: '', ageRangeMax: '', proof: 'no' }, false],
        [{ ageRange: 'yes', ageRangeMin: '10', ageRangeMax: '', proof: 'no' }, true],
        [{ ageRange: 'yes', ageRangeMin: '12', ageRangeMax: '140', proof: 'no' }, true],
        [{ ageRange: 'yes', ageRangeMin: '11', ageRangeMax: 'daddy', proof: 'no' }, false],
        [{ ageRange: 'yes', ageRangeMin: 'asda', ageRangeMax: 'tesco', proof: 'no' }, false],
    ])('should do some stuff for %s = %s', (candidate, validity) => {
        const result = passengerTypeDetailsSchema.isValidSync(candidate);
        expect(result).toEqual(validity);
    });
});
