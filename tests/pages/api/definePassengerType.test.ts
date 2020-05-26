import { passengerTypeDetailsSchema } from '../../../src/pages/api/definePassengerType';

describe('passengerTypeDetailsSchema', () => {
    it.each([
        [{}, false],
        [{ ageRange: 'no' }, false],
        [{ ageRange: 'yes' }, false],
        [{ proof: 'maybe' }, false],
        [{ proof: 'no' }, false],
        [{ proof: 'yes' }, false],
        [{ ageRange: 'yes', proof: 'no' }, false],
        [{ ageRange: 'no', proof: 'yes' }, false],
        [{ ageRange: 'yes', ageRangeMin: '', ageRangeMax: '', proof: 'no' }, false],
        [{ ageRange: 'yes', ageRangeMin: '11', ageRangeMax: 'daddy', proof: 'no' }, false],
        [{ ageRange: 'yes', ageRangeMin: 'asda', ageRangeMax: 'tesco', proof: 'no' }, false],
        [{ ageRange: 'yes', ageRangeMin: '-12', ageRangeMax: '12', proof: 'no' }, false],
        [{ ageRange: 'yes', ageRangeMin: '1.23453', ageRangeMax: '12', proof: 'no' }, false],
        [{ ageRange: 'no', proof: 'no' }, true],
        [{ ageRange: 'yes', ageRangeMin: '10', ageRangeMax: '', proof: 'no' }, true],
        [{ ageRange: 'yes', ageRangeMin: '12', ageRangeMax: '140', proof: 'no' }, true],
        [{ ageRange: 'no', proof: 'yes', proofDocuments: ['Membership Card', 'Student Card'] }, true],
        [
            {
                ageRange: 'yes',
                ageRangeMin: '0',
                ageRangeMax: '150',
                proof: 'yes',
                proofDocuments: ['Membership Card', 'Student Card', 'Identity Document'],
            },
            true,
        ],
    ])('should validate that %s is %s', (candidate, validity) => {
        const result = passengerTypeDetailsSchema.isValidSync(candidate);
        expect(result).toEqual(validity);
    });
});
