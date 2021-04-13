import { selectFareType, defineUserTypeAndTimeRestrictions, completeSinglePages } from '../support/steps';
import { selectRandomOptionFromDropDown } from '../support/helpers';

describe('The single faretype product journey', () => {
    it('completes successfully for csv upload', () => {
        selectFareType('single');
        defineUserTypeAndTimeRestrictions();
        completeSinglePages(true);
    });
});
