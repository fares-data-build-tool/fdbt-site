import React, { ReactElement } from 'react';
import { ErrorInfo } from '../types';
import FormElementWrapper from './FormElementWrapper';

interface BaseElementAttributes {
    id: string;
    name: string;
    label: string;
}

export interface RadioWithoutConditionals extends BaseElementAttributes {
    value: string;
}

export interface RadioWithConditionalInputs extends RadioWithoutConditionals {
    dataAriaControls: string;
    hint: {
        id: string;
        content: string;
    };
    inputType: string;
    inputs: BaseElementAttributes[];
    inputErrors: ErrorInfo[];
}

export type RadioButton = RadioWithoutConditionals | RadioWithConditionalInputs;

export interface RadioConditionalInputFieldset {
    heading: {
        id: string;
        content: string;
    };
    radios: RadioButton[];
    radioError: ErrorInfo[];
}

export interface RadioConditionalInputProps {
    fieldset: RadioConditionalInputFieldset;
}

const renderConditionalTextInput = (radio: RadioWithConditionalInputs): ReactElement => {
    return (
        <div className="govuk-radios__conditional govuk-radios__conditional--hidden" id={radio.dataAriaControls}>
            <span className="govuk-hint" id={radio.hint.id}>
                {radio.hint.content}
            </span>
            {radio.inputs.map(input => {
                return (
                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor={input.id}>
                            {input.label}
                        </label>
                        <input
                            className="govuk-input govuk-!-width-one-third"
                            id={input.id}
                            name={input.name}
                            type="text"
                        />
                    </div>
                );
            })}
        </div>
    );
};

const renderConditionalCheckbox = (radio: RadioWithConditionalInputs): ReactElement => {
    return (
        <div
            className={`govuk-radios__conditional ${
                radio.inputErrors.length > 0 ? '' : 'govuk-radios__conditional--hidden'
            }`}
            id={radio.dataAriaControls}
        >
            <div className="govuk-form-group">
                <fieldset className="govuk-fieldset" aria-describedby={radio.hint.id}>
                    <span className="govuk-hint" id={radio.hint.id}>
                        {radio.hint.content}
                    </span>
                    <div className="govuk-checkboxes">
                        {radio.inputs.map(input => {
                            return (
                                <div className="govuk-checkboxes__item">
                                    <input
                                        className="govuk-checkboxes__input"
                                        id={input.id}
                                        name={input.name}
                                        value={input.label}
                                        type="checkbox"
                                    />
                                    <label className="govuk-label govuk-checkboxes__label" htmlFor={input.id}>
                                        {input.label}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </fieldset>
            </div>
        </div>
    );
};

const renderConditionalRadioButton = (radio: RadioWithConditionalInputs, radioLabel: ReactElement): ReactElement => {
    return (
        <>
            <div className="govuk-radios__item">
                <input
                    className="govuk-radios__input"
                    id={radio.id}
                    name={radio.name}
                    type="radio"
                    value={radio.value}
                    data-aria-controls={radio.dataAriaControls}
                />
                {radioLabel}
            </div>
            {radio.inputType === 'checkbox' ? renderConditionalCheckbox(radio) : renderConditionalTextInput(radio)}
        </>
    );
};

const renderRadioButtonSet = (radio: RadioButton): ReactElement => {
    const radioButtonLabel: ReactElement = (
        <label className="govuk-label govuk-radios__label" htmlFor={radio.id}>
            {radio.label}
        </label>
    );
    if (
        (radio as RadioWithConditionalInputs).dataAriaControls !== undefined &&
        (radio as RadioWithConditionalInputs).inputs !== undefined &&
        (radio as RadioWithConditionalInputs).hint !== undefined
    ) {
        const radioButton = radio as RadioWithConditionalInputs;
        return renderConditionalRadioButton(radioButton, radioButtonLabel);
    }
    const radioButton = radio as RadioWithoutConditionals;
    return (
        <div className="govuk-radios__item">
            <input
                className="govuk-radios__input"
                id={radioButton.id}
                name={radioButton.name}
                type="radio"
                value={radioButton.value}
            />
            {radioButtonLabel}
        </div>
    );
};

const checkInputsForErrors = (fieldset: RadioConditionalInputFieldset): ErrorInfo[] => {
    let inputErrors: ErrorInfo[] = [];
    fieldset.radios.forEach((radio: RadioButton) => {
        const conditionalRadio: RadioWithConditionalInputs = radio as RadioWithConditionalInputs;
        if (conditionalRadio.inputErrors && conditionalRadio.inputErrors.length > 0) {
            inputErrors = conditionalRadio.inputErrors;
        }
    });
    return inputErrors;
};

export const checkFieldsetForErrors = (fieldset: RadioConditionalInputFieldset): ErrorInfo[] => {
    let errorToDisplay: ErrorInfo[] = [];
    const inputErrors = checkInputsForErrors(fieldset);
    if (fieldset.radioError.length > 0) {
        errorToDisplay = fieldset.radioError;
    } else if (inputErrors.length > 0) {
        errorToDisplay = inputErrors;
    }
    return errorToDisplay;
};

const RadioConditionalInput = ({ fieldset }: RadioConditionalInputProps): ReactElement => {
    const errorToDisplay = checkFieldsetForErrors(fieldset);
    console.log({ errorToDisplay });
    return (
        <div className={`govuk-form-group ${errorToDisplay.length > 0 ? 'govuk-form-group--error' : ''}`}>
            <fieldset className="govuk-fieldset" aria-describedby={fieldset.heading.id}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h2 className="govuk-fieldset__heading" id={fieldset.heading.id}>
                        {fieldset.heading.content}
                    </h2>
                </legend>
                <FormElementWrapper
                    errors={errorToDisplay}
                    errorId={fieldset.heading.id}
                    errorClass="govuk-radios--error"
                >
                    <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
                        {fieldset.radios.map(radio => renderRadioButtonSet(radio))}
                    </div>
                </FormElementWrapper>
            </fieldset>
            <br />
            <br />
        </div>
    );
};

export default RadioConditionalInput;
