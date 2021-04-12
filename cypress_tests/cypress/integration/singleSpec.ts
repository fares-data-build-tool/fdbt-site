import { selectFareType, defineUserTypeAndTimeRestrictions } from '../support/steps';
import { selectRandomOptionFromDropDown } from '../support/helpers';

describe('The single faretype product journey', () => {
    it('completes successfully', () => {
        selectFareType('single');
        defineUserTypeAndTimeRestrictions();
        selectRandomOptionFromDropDown('service');
    });
});
