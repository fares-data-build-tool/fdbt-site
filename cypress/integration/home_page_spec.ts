export const throwInvalidRandomSelectorError = (): void => {
    throw new Error('Invalid random selector');
};

export const getElementById = (id: string): Cypress.Chainable<JQuery<HTMLElement>> => {
    return cy.get(`[id=${id}]`);
};

export const clickElementById = (id: string): Cypress.Chainable<JQuery<HTMLElement>> => {
    return getElementById(id).click();
};

export const getRandomNumber = (min: number, max: number): number => Cypress._.random(min, max);

export const continueButtonClick = (): Cypress.Chainable<JQuery<HTMLElement>> => clickElementById('continue-button');

export const completeGroupSizePage = (): string => {
    const groupSize = getRandomNumber(1, 30).toString();
    getElementById('max-group-size').type(groupSize);
    continueButtonClick();
    return groupSize;
};

export const completeDefineGroupPassengersPage = (): string[] => {
    const firstPassengerType = `passenger-type-${getRandomNumber(0, 6)}`;
    clickElementById(firstPassengerType);

    let secondPassengerType = `passenger-type-${getRandomNumber(0, 6)}`;
    while (firstPassengerType === secondPassengerType) {
        secondPassengerType = `passenger-type-${getRandomNumber(0, 6)}`;
    }
    clickElementById(secondPassengerType);

    continueButtonClick();
    return [firstPassengerType, secondPassengerType];
};

export const randomlyChooseAProof = (): void => {
    const randomSelector = getRandomNumber(1, 3);
    switch (randomSelector) {
        case 1:
            // 1. Membership card
            clickElementById('membership-card');
            break;
        case 2:
            // 2. Student card
            clickElementById('student-card');
            break;
        case 3:
            // 3. Identity Document
            clickElementById('identity-document');
            break;
        default:
            throwInvalidRandomSelectorError();
    }
};

export const randomlyChooseAgeLimits = (): void => {
    const randomSelector = getRandomNumber(1, 4);
    switch (randomSelector) {
        case 1:
            // 1. Max age, no min age
            getElementById('age-range-max').type('30');
            break;
        case 2:
            // 2. Min age, no max age
            getElementById('age-range-min').type('12');
            break;
        case 3:
            // 3. Max and min age, diff values
            getElementById('age-range-min').type('13');
            getElementById('age-range-max').type('18');
            break;
        case 4:
            // 4. Max and min age, same values
            getElementById('age-range-min').type('50');
            getElementById('age-range-max').type('50');
            break;
        default:
            throwInvalidRandomSelectorError();
    }
};

export const completeUserDetailsPage = (group: boolean, maxGroupNumber: string, adult: boolean): void => {
    const firstRandomSelector = getRandomNumber(1, 4);
    const secondRandomSelector = getRandomNumber(1, 2);

    if (group) {
        getElementById('min-number-of-passengers').type('1');
        getElementById('max-number-of-passengers').type(maxGroupNumber);
    }
    if (!adult) {
        switch (firstRandomSelector) {
            case 1:
                // 1. No to both questions
                clickElementById('age-range-not-required');
                clickElementById('proof-not-required');
                continueButtonClick();
                break;
            case 2:
                // 2. No to age limit, Yes to Proof
                clickElementById('age-range-not-required');
                clickElementById('proof-required');
                randomlyChooseAProof();
                continueButtonClick();
                break;
            case 3:
                // 3. Yes to age limit, Yes to Proof
                clickElementById('age-range-required');
                randomlyChooseAgeLimits();
                clickElementById('proof-required');
                randomlyChooseAProof();
                continueButtonClick();
                break;
            case 4:
                // 4. Yes to age limit, No to Proof
                clickElementById('age-range-required');
                randomlyChooseAgeLimits();
                clickElementById('proof-not-required');
                continueButtonClick();
                break;
            default:
                throwInvalidRandomSelectorError();
        }
    } else {
        switch (secondRandomSelector) {
            case 1:
                // 1. No to age range
                clickElementById('age-range-not-required');
                continueButtonClick();
                break;
            case 2:
                // 2. Yes to age range
                clickElementById('age-range-required');
                randomlyChooseAgeLimits();
                continueButtonClick();
                break;
            default:
                throwInvalidRandomSelectorError();
        }
    }
};

export const completeGroupPassengerDetailsPages = (): void => {
    const groupSize = completeGroupSizePage();
    const passengerTypes = completeDefineGroupPassengersPage();
    const sortedPassengerTypes = passengerTypes.sort();

    for (let i = 0; i < 2; i += 1) {
        if (sortedPassengerTypes[i] === 'passenger-type-0') {
            completeUserDetailsPage(true, groupSize, true);
        } else {
            completeUserDetailsPage(true, groupSize, false);
        }
    }
};

export const randomlyDetermineUserType = (): void => {
    const randomSelector = getRandomNumber(4, 4);

    switch (randomSelector) {
        case 1: {
            // Click Any and continue
            clickElementById('passenger-type-anyone');
            continueButtonClick();
            break;
        }
        case 2: {
            // Click Group, complete following pages, and continue
            clickElementById('passenger-type-group');
            continueButtonClick();
            completeGroupPassengerDetailsPages();
            break;
        }
        case 3: {
            // Click Adult, complete following pages, and continue
            clickElementById('passenger-type-adult');
            continueButtonClick();
            completeUserDetailsPage(false, '0', true);
            break;
        }
        case 4: {
            // Click a non-Any non-Group, complete the next page, and continue
            const otherPassengerTypes = ['child', 'infant', 'senior', 'student', 'youngPerson'];
            const randomPassengerType = otherPassengerTypes[getRandomNumber(0, 4)];
            clickElementById(`passenger-type-${randomPassengerType}`);
            continueButtonClick();
            completeUserDetailsPage(false, '0', false);
            break;
        }
        default: {
            throwInvalidRandomSelectorError();
        }
    }
};

export const selectYesToTimeRestrictions = (): void => {
    clickElementById('valid-days-required');

    const checkboxIds = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'bankHoliday'];
    const randomNumber = getRandomNumber(1, 8);

    for (let i = 0; i < randomNumber; i += 1) {
        clickElementById(checkboxIds[i]);
    }
    continueButtonClick();
};

export const randomlyDecideTimeRestrictions = (): void => {
    if (getRandomNumber(2, 2) === 1) {
        clickElementById('valid-days-not-required');
    } else {
        selectYesToTimeRestrictions();


    }
};

describe('The Home Page', () => {
    it('successfully loads', () => {
        cy.visit('?disableAuth=true');

        clickElementById('start-now-button');

        clickElementById('fare-type-flatFare');
        continueButtonClick();

        randomlyDetermineUserType();
        randomlyDecideTimeRestrictions();
    });
});
