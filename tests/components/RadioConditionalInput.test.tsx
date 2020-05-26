import { shallow } from 'enzyme';
import React from 'react';
import RadioConditionalInput, {
    RadioConditionalInputFieldset,
    checkFieldsetForErrors,
    RadioWithConditionalInputs,
} from '../../src/components/RadioConditionalInput';
import { mockDefinePassengerTypeFieldsetsWithRadioAndInputErrors } from '../testData/mockData';

describe('RadioConditionalInput', () => {
    it('should render an ordinary set of radio buttons when given a base fieldset', () => {
        const fieldset: RadioConditionalInputFieldset = {
            heading: {
                id: 'define-passenger-age-range',
                content: 'Does the passenger type have an age range?',
            },
            radios: [
                { id: 'age-range-required', name: 'ageRange', value: 'yes', label: 'Yes' },
                { id: 'age-range-not-required', name: 'ageRange', value: 'no', label: 'No' },
            ],
            radioError: [],
        };
        const wrapper = shallow(<RadioConditionalInput fieldset={fieldset} />);
        expect(wrapper).toMatchSnapshot();
    });

    it('should render a set of radio buttons with conditional inputs when given a fieldset referencing inputs', () => {
        const fieldset: RadioConditionalInputFieldset = {
            heading: {
                id: 'define-passenger-age-range',
                content: 'Does the passenger type have an age range?',
            },
            radios: [
                {
                    id: 'age-range-required',
                    name: 'ageRange',
                    value: 'yes',
                    label: 'Yes',
                    dataAriaControls: 'age-range-required-conditional',
                    hint: { id: 'define-passenger-hint', content: 'Enter a minimum age for this passenger type.' },
                    inputType: 'text',
                    inputs: [{ id: 'age-range-min', name: 'ageRangeMin', label: 'Minimum age (if applicable)' }],
                    inputErrors: [],
                },
                { id: 'age-range-not-required', name: 'ageRange', value: 'no', label: 'No' },
            ],
            radioError: [],
        };
        const wrapper = shallow(<RadioConditionalInput fieldset={fieldset} />);
        expect(wrapper).toMatchSnapshot();
    });

    describe('checkFieldsetForErrors', () => {
        it('should extract input errors from the fieldset', () => {
            const fieldset = mockDefinePassengerTypeFieldsetsWithRadioAndInputErrors[0];
            const conditionalRadioArray = (mockDefinePassengerTypeFieldsetsWithRadioAndInputErrors[0]
                .radios[0] as unknown) as RadioWithConditionalInputs;
            const expectedError = conditionalRadioArray.inputErrors;
            const errorToDisplay = checkFieldsetForErrors(fieldset);
            expect(errorToDisplay).toBe(expectedError);
        });
    });
});
