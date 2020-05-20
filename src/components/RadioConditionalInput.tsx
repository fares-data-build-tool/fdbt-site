import React, { ReactElement } from 'react';
import { ErrorInfo } from '../types';
import FormElementWrapper from './FormElementWrapper';

interface RadioWithoutConditionals {
    id: string;
    name: string;
    value: string;
    label: string;
}

interface ConditionalInput {
    id: string;
    name: string;
    label: string;
}

interface RadioWithConditionalInputs extends RadioWithoutConditionals {
    dataAriaControls: string;
    hint: {
        id: string;
        content: string;
    };
    inputType: string;
    inputs: ConditionalInput[];
}

type RadioButton = RadioWithoutConditionals | RadioWithConditionalInputs;

export interface RadioConditionalInputFieldset {
    heading: {
        id: string;
        content: string;
    };
    radios: RadioButton[];
}

export interface RadioConditionalInputProps {
    fieldset: RadioConditionalInputFieldset;
    errors: ErrorInfo[];
    errorId: string;
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
        <div className="govuk-radios__conditional govuk-radios__conditional--hidden" id={radio.dataAriaControls}>
            <div className="govuk-form-group">
                <fieldset className="govuk-fieldset" aria-describedby={radio.hint.id}>
                    <span className="govuk-hint" id={radio.hint.id}>
                        {radio.hint.content}
                    </span>
                    <div className="govuk-checkboxes">
                        {radio.inputs.map(input => {
                            return (
                                <div className="govuk-checkboxes__item">
                                    <label className="govuk-label govuk-checkboxes__label" htmlFor={input.id}>
                                        {input.label}
                                    </label>
                                    <input
                                        className="govuk-checkboxes__input"
                                        id={input.id}
                                        name={input.name}
                                        value={input.label}
                                        type="checkbox"
                                    />
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

const renderRadioButton = (radio: RadioButton): ReactElement => {
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

const RadioConditionalInput = ({ errors = [], errorId, fieldset }: RadioConditionalInputProps): ReactElement => {
    return (
        <div>
            <fieldset className="govuk-fieldset" aria-describedby={fieldset.heading.id}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h2 className="govuk-fieldset__heading" id={fieldset.heading.id}>
                        {fieldset.heading.content}
                    </h2>
                </legend>
                <FormElementWrapper errors={errors} errorId={errorId} errorClass="govuk-radios--error">
                    <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
                        {fieldset.radios.map(radio => renderRadioButton(radio))}
                    </div>
                </FormElementWrapper>
            </fieldset>
            <br />
            <br />
        </div>
    );
};

export default RadioConditionalInput;
