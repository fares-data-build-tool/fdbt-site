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
        const productName = 'Flat Fare Test Product';
        getHomePage();
        stepsToSelectFlatFareServiceSelection();
        completeFlatFarePages(productName);
            clickSelectedNumberOfCheckboxes(false);
        continueButtonClick();
        completeProductDateInformationPage();
        continueButtonClick();
        isUuidStringValid();
    });
});
