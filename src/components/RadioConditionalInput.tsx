import React, { ReactElement } from 'react';
import camelCase from 'lodash/camelCase';
import { ErrorInfo, BaseReactElement } from '../interfaces';
import FormElementWrapper from './FormElementWrapper';

export interface RadioWithoutConditionals extends BaseReactElement {
    value: string;
}

export interface RadioWithConditionalInputs extends RadioWithoutConditionals {
    dataAriaControls: string;
    hint: {
        id: string;
        content: string;
    };
    inputType: 'checkbox' | 'date' | 'text';
    inputs: BaseReactElement[];
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

export const createErrorId = (input: BaseReactElement, inputErrors: ErrorInfo[]): string => {
    const el = inputErrors.find(({ id }) => id === input.id);
    if (el) {
        return el.id;
    }
    return '';
};

export const renderConditionalTextInput = (radio: RadioWithConditionalInputs): ReactElement => {
    const error = radio.inputErrors.length > 0;

    return (
        <div
            className={`govuk-radios__conditional${error ? '' : ' govuk-radios__conditional--hidden'}`}
            id={radio.dataAriaControls}
        >
            <span className="govuk-hint" id={radio.hint.id}>
                {radio.hint.content}
            </span>
            {radio.inputs.map(input => {
                const errorId = createErrorId(input, radio.inputErrors);
                return (
                    <div
                        key={input.id}
                        className={`govuk-form-group${errorId !== '' ? ' govuk-form-group--error' : ''}`}
                    >
                        <label className="govuk-label" htmlFor={input.id}>
                            {input.label}
                        </label>
                        <FormElementWrapper
                            errors={radio.inputErrors}
                            errorId={errorId}
                            errorClass="govuk-input--error"
                        >
                            <input
                                className="govuk-input govuk-!-width-one-third"
                                id={input.id}
                                name={input.name}
                                type="text"
                            />
                        </FormElementWrapper>
                    </div>
                );
            })}
        </div>
    );
};

const renderConditionalCheckbox = (radio: RadioWithConditionalInputs): ReactElement => {
    const error = radio.inputErrors.length > 0;

    return (
        <div
            className={`govuk-radios__conditional ${error ? '' : 'govuk-radios__conditional--hidden'}`}
            id={radio.dataAriaControls}
        >
            <div className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}>
                <fieldset className="govuk-fieldset" aria-describedby={radio.hint.id}>
                    <span className="govuk-hint" id={radio.hint.id}>
                        {radio.hint.content}
                    </span>
                    <FormElementWrapper
                        errors={radio.inputErrors}
                        errorId={error ? radio.inputErrors[0].id : ''}
                        errorClass=""
                    >
                        <div className="govuk-checkboxes">
                            {radio.inputs.map(input => {
                                return (
                                    <div key={input.id} className="govuk-checkboxes__item">
                                        <input
                                            className="govuk-checkboxes__input"
                                            id={input.id}
                                            name={input.name}
                                            value={camelCase(input.id)}
                                            type="checkbox"
                                        />
                                        <label className="govuk-label govuk-checkboxes__label" htmlFor={input.id}>
                                            {input.label}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </FormElementWrapper>
                </fieldset>
            </div>
        </div>
    );
};

const renderConditionalDateInputs = (radio: RadioWithConditionalInputs): ReactElement => {
    const error = radio.inputErrors.length > 0;

    console.log('crap error', radio.inputErrors);
    return (
        <div
            className={`govuk-radios__conditional ${error ? '' : 'govuk-radios__conditional--hidden'}`}
            id={radio.dataAriaControls}
        >
            {radio.inputs.map(input => {
                const inputGroupError = radio.inputErrors.find(({ id }) => id.includes(input.id));

                return (
                    <div className={`govuk-form-group${inputGroupError ? ' govuk-form-group--error' : ''}`}>
                        <fieldset className="govuk-fieldset" role="group" aria-describedby="product-date-information">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                <h1 className="govuk-fieldset__heading">{input.label}</h1>
                            </legend>
                            <div className="govuk-date-input" id={input.id}>
                                <div className="govuk-date-input__item">
                                    <div className="govuk-form-group">
                                        <label className="govuk-label govuk-date-input__label" htmlFor={`${input.id}-day`}>
                                            Day
                                        </label>
                                        <FormElementWrapper
                                            errors={radio.inputErrors}
                                            errorId={inputGroupError ? `${input.id}-day` : ''}
                                            errorClass="govuk-input--error"
                                        >
                                            <input
                                                className="govuk-input govuk-date-input__input govuk-input--width-2"
                                                id={`${input.id}-day`}
                                                name={`${input.name}Day`}
                                                type="text"
                                                pattern="[0-9]*"
                                                inputMode="numeric"
                                            />
                                        </FormElementWrapper>
                                    </div>
                                </div>
                                <div className="govuk-date-input__item">
                                    <div className="govuk-form-group">
                                        <label className="govuk-label govuk-date-input__label" htmlFor={`${input.id}-month`}>
                                            Month
                                        </label>
                                        <FormElementWrapper
                                            errors={radio.inputErrors}
                                            errorId={inputGroupError ? `${input.id}-month` : ''}
                                            errorClass="govuk-input--error"
                                        >
                                            <input
                                                className="govuk-input govuk-date-input__input govuk-input--width-2"
                                                id={`${input.id}-month`}
                                                name={`${input.name}Month`}
                                                type="text"
                                                pattern="[0-9]*"
                                                inputMode="numeric"
                                            />
                                        </FormElementWrapper>
                                    </div>
                                </div>
                                <div className="govuk-date-input__item">
                                    <div className="govuk-form-group">
                                        <label className="govuk-label govuk-date-input__label" htmlFor={`${input.id}-year`}>
                                            Year
                                        </label>
                                        <FormElementWrapper
                                            errors={radio.inputErrors}
                                            errorId={inputGroupError ? `${input.id}-year` : ''}
                                            errorClass="govuk-input--error"
                                        >
                                            <input
                                                className="govuk-input govuk-date-input__input govuk-input--width-4"
                                                id={`${input.id}-year`}
                                                name={`${input.name}Year`}
                                                type="text"
                                                pattern="[0-9]*"
                                                inputMode="numeric"
                                            />
                                        </FormElementWrapper>
                                        ∏
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                );
            })}
        </div>
    );
};
const renderConditionalRadioButton = (radio: RadioWithConditionalInputs, radioLabel: ReactElement): ReactElement => {
    const baseRadioInput = (
        <input
            className="govuk-radios__input"
            id={radio.id}
            name={radio.name}
            type="radio"
            value={radio.value}
            data-aria-controls={radio.dataAriaControls}
        />
    );
    const radioInputWithError = (
        <input
            className="govuk-radios__input"
            id={radio.id}
            name={radio.name}
            type="radio"
            value={radio.value}
            data-aria-controls={radio.dataAriaControls}
            checked
        />
    );

    const inputTypeMap = {
        checkbox: renderConditionalCheckbox,
        text: renderConditionalTextInput,
        date: renderConditionalDateInputs,
    };

    return (
        <div key={radio.id}>
            <div className="govuk-radios__item">
                {radio.inputErrors.length > 0 ? radioInputWithError : baseRadioInput}
                {radioLabel}
            </div>
            {inputTypeMap[radio.inputType](radio)}
        </div>
    );
};

const isRadioWithConditionalInputs = (
    radioButton: RadioWithConditionalInputs | RadioWithoutConditionals,
): radioButton is RadioWithConditionalInputs => {
    return (radioButton as RadioWithConditionalInputs).hint !== undefined;
};

const renderRadioButtonSet = (radio: RadioButton): ReactElement => {
    const radioButtonLabel: ReactElement = (
        <label className="govuk-label govuk-radios__label" htmlFor={radio.id}>
            {radio.label}
        </label>
    );

    if (isRadioWithConditionalInputs(radio)) {
        return renderConditionalRadioButton(radio, radioButtonLabel);
    }

    return (
        <div key={radio.id} className="govuk-radios__item">
            <input className="govuk-radios__input" id={radio.id} name={radio.name} type="radio" value={radio.value} />
            {radioButtonLabel}
        </div>
    );
};

const RadioConditionalInput = ({ fieldset }: RadioConditionalInputProps): ReactElement => {
    const radioError = fieldset.radioError.length > 0;

    return (
        <div className={`govuk-form-group ${radioError ? 'govuk-form-group--error' : ''}`}>
            <fieldset className="govuk-fieldset" aria-describedby={fieldset.heading.id}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h2 className="govuk-fieldset__heading" id={fieldset.heading.id}>
                        {fieldset.heading.content}
                    </h2>
                </legend>
                <FormElementWrapper
                    errors={fieldset.radioError}
                    errorId={radioError ? fieldset.radioError[0].id : ''}
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
