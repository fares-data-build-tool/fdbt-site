import { defineUserTypeAndTimeRestrictions, completeFlatFarePages, selectFareType } from '../support/steps';
import {
    clickSelectedNumberOfCheckboxes,
    continueButtonClick,
    completeProductDateInformationPage,
    isUuidStringValid,
} from '../support/helpers';

describe('The flat fare faretype product journey', () => {
    it('completes successfully', () => {
        selectFareType('flatFare');
        defineUserTypeAndTimeRestrictions();
        completeFlatFarePages('Flat Fare Test Product');
        clickSelectedNumberOfCheckboxes(false);
        continueButtonClick();
        completeProductDateInformationPage();
        continueButtonClick();
        isUuidStringValid();
    });
});
