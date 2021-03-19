import { stepsToSelectFlatFareServiceSelection, completeFlatFarePages } from '../support/steps';
import {
    getHomePage,
    clickSelectedNumberOfCheckboxes,
    continueButtonClick,
    completeProductDateInformationPage,
    isUuidStringValid,
} from '../support/helpers';

describe('The Home Page', () => {
    it('successfully loads', () => {
        getHomePage();
        stepsToSelectFlatFareServiceSelection();
        completeFlatFarePages('Flat Fare Test Product');
        clickSelectedNumberOfCheckboxes(false);
        continueButtonClick();
        completeProductDateInformationPage();
        continueButtonClick();
        isUuidStringValid();
    });
});
