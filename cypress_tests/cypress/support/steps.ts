import {
    startPageButtonClick,
    clickElementById,
    continueButtonClick,
    randomlyDetermineUserType,
    randomlyDecideTimeRestrictions,
    randomlyChooseAndSelectServices,
    getElementById,
    getHomePage,
    fareTypeToFareTypeIdMapper,
} from './helpers';

export const defineUserTypeAndTimeRestrictions = (): void => {
    randomlyDetermineUserType();
    randomlyDecideTimeRestrictions();
    continueButtonClick();
};

export const selectFareType = (fareType: 'single' | 'period' | 'return' | 'flatFare' | 'multiOperator' | 'schoolService'): void => {
    getHomePage();
    startPageButtonClick();
    clickElementById(fareTypeToFareTypeIdMapper(fareType));
    continueButtonClick();
}

export const completeFlatFarePages = (productName: string): void => {
    randomlyChooseAndSelectServices();
    continueButtonClick();
    getElementById('product-details-name').type(productName);
    getElementById('product-details-price').type('50.50');
    continueButtonClick();
    continueButtonClick();
};

export const completeSinglePages = (csvUpload: boolean): void => {

}