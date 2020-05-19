import React, { ReactElement } from 'react';
import { ErrorInfo } from '../types';
import FormElementWrapper from './FormElementWrapper';

interface RadioWithoutConditionals {
    id: string;
    name: string;
    value: string;
    label: string;
}

interface RadioWithConditionalInputs extends RadioWithoutConditionals {
    dataAriaControls: string;
    textInputs: {
        id: string;
        name: string;
        label: string;
    }[];
}

type RadioButton = RadioWithoutConditionals | RadioWithConditionalInputs;

export interface RadioConditionalInputFieldset {
    heading: {
        id: string;
        content: string;
    };
    hint: {
        id: string;
        content: string;
    };
    radios: [RadioWithoutConditionals | RadioWithConditionalInputs];
}

export interface RadioConditionalInputProps {
    fieldset: RadioConditionalInputFieldset;
    errors: ErrorInfo[];
    errorId: string;
}

const renderConditionalInputs = (radio: RadioWithConditionalInputs): ReactElement => {
    return (
        <div className="govuk-radios__conditional govuk-radios__conditional--hidden" id={radio.dataAriaControls}>
            {radio.textInputs.length !== 0
                ? radio.textInputs.map(input => {
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
                  })
                : ''}
        </div>
    );
};

const renderRadioButton = (radio: RadioButton): ReactElement => {
    if (
        (radio as RadioWithConditionalInputs).dataAriaControls !== undefined &&
        (radio as RadioWithConditionalInputs).textInputs !== undefined
    ) {
        return (
            <>
                <div className="govuk-radios__item">
                    <input
                        className="govuk-radios__input"
                        id={radio.id}
                        name={radio.name}
                        type="radio"
                        value={radio.value}
                        data-aria-controls={(radio as RadioWithConditionalInputs).dataAriaControls}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor={radio.id}>
                        {radio.label}
                    </label>
                </div>
                {renderConditionalInputs(radio as RadioWithConditionalInputs)}
            </>
        );
    }
    return (
        <div className="govuk-radios__item">
            <input className="govuk-radios__input" id={radio.id} name={radio.name} type="radio" value={radio.value} />
            <label className="govuk-label govuk-radios__label" htmlFor={radio.id}>
                {radio.label}
            </label>
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
                <span className="govuk-hint" id={fieldset.hint.id}>
                    {fieldset.hint.content}
                </span>
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
