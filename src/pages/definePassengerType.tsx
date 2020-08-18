import React, { ReactElement } from 'react';
import { parseCookies } from 'nookies';
import TwoThirdsLayout from '../layout/Layout';
import { PASSENGER_TYPE_COOKIE, GROUP_PASSENGER_TYPES_ATTRIBUTE } from '../constants';
import ErrorSummary from '../components/ErrorSummary';
import RadioConditionalInput, {
    RadioConditionalInputFieldset,
    createErrorId,
} from '../components/RadioConditionalInput';
import {
    ErrorInfo,
    CustomAppProps,
    GroupDefinition,
    NextPageContextWithSession,
    BaseReactElement,
} from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import { getSessionAttribute } from '../utils/sessions';
import FormElementWrapper from '../components/FormElementWrapper';
import { getErrorsByIds } from '../utils';

const title = 'Define Passenger Type - Fares Data Build Tool';
const description = 'Define Passenger Type page of the Fares Data Build Tool';

export interface GroupDefinitionWithErrors extends GroupDefinition {
    errors: ErrorInfo[];
}

export interface TextInputFieldset {
    heading: {
        id: string;
        content: string;
    };
    inputs: BaseReactElement[];
    inputErrors: ErrorInfo[];
}

export interface DefinePassengerTypeProps {
    group: boolean;
    errors: ErrorInfo[];
    fieldsets: RadioConditionalInputFieldset[];
    numberOfPassengerTypeFieldset?: TextInputFieldset;
    groupPassengerType?: string;
}

export const getFieldsets = (errors: ErrorInfo[], passengerType?: string): RadioConditionalInputFieldset[] => {
    const ageRangeFieldset: RadioConditionalInputFieldset = {
        heading: {
            id: 'define-passenger-age-range',
            content: passengerType
                ? `Do ${passengerType} passengers have an age range?`
                : 'Does the passenger type have an age range?',
        },
        radios: [
            {
                id: 'age-range-required',
                name: 'ageRange',
                value: 'Yes',
                dataAriaControls: 'age-range-required-conditional',
                label: 'Yes',
                hint: {
                    id: 'define-passenger-age-range-hint',
                    content: 'Enter a minimum and/or maximum age for this passenger type.',
                },
                inputType: 'text',
                inputs: [
                    {
                        id: 'age-range-min',
                        name: 'ageRangeMin',
                        label: 'Minimum Age (if applicable)',
                    },
                    {
                        id: 'age-range-max',
                        name: 'ageRangeMax',
                        label: 'Maximum Age (if applicable)',
                    },
                ],
                inputErrors: getErrorsByIds(['age-range-min', 'age-range-max'], errors),
            },
            {
                id: 'age-range-not-required',
                name: 'ageRange',
                value: 'No',
                label: 'No',
            },
        ],
        radioError: getErrorsByIds(['define-passenger-age-range'], errors),
    };

    const proofRequiredFieldset: RadioConditionalInputFieldset = {
        heading: {
            id: 'define-passenger-proof',
            content: passengerType
                ? `Do ${passengerType} passengers require a proof document?`
                : 'Does the passenger type require a proof document?',
        },
        radios: [
            {
                id: 'proof-required',
                name: 'proof',
                value: 'Yes',
                dataAriaControls: 'proof-required-conditional',
                label: 'Yes',
                hint: {
                    id: 'define-passenger-proof-hint',
                    content: 'Select the applicable proof document(s).',
                },
                inputType: 'checkbox',
                inputs: [
                    {
                        id: 'membership-card',
                        name: 'proofDocuments',
                        label: 'Membership Card',
                    },
                    {
                        id: 'student-card',
                        name: 'proofDocuments',
                        label: 'Student Card',
                    },
                    {
                        id: 'identity-document',
                        name: 'proofDocuments',
                        label: 'Identity Document',
                    },
                ],
                inputErrors: getErrorsByIds(['proof-required'], errors),
            },
            {
                id: 'proof-not-required',
                name: 'proof',
                value: 'No',
                label: 'No',
            },
        ],
        radioError: getErrorsByIds(['define-passenger-proof'], errors),
    };
    return [ageRangeFieldset, proofRequiredFieldset];
};

export const getNumberOfPassengerTypeFieldset = (errors: ErrorInfo[], passengerType: string): TextInputFieldset => ({
    heading: {
        id: 'number-of-passenger-type-heading',
        content: `How many ${passengerType} passengers can be in the group?`,
    },
    inputs: [
        {
            id: 'min-number-of-passengers',
            name: 'minNumber',
            label: 'Minimum (optional)',
        },
        {
            id: 'max-number-of-passengers',
            name: 'maxNumber',
            label: 'Maximum (required)',
        },
    ],
    inputErrors: getErrorsByIds(['min-number-of-passengers', 'max-number-of-passengers'], errors),
});

export const numberOfPassengerTypeQuestion = (fieldset: TextInputFieldset): ReactElement => {
    const error = fieldset.inputErrors.length > 0;
    return (
        <div className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}>
            <fieldset className="govuk-fieldset" aria-describedby={fieldset.heading.id}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h2 className="govuk-fieldset__heading" id={fieldset.heading.id}>
                        {fieldset.heading.content}
                    </h2>
                </legend>
                {fieldset.inputs.map((input) => {
                    const errorId = createErrorId(input, fieldset.inputErrors);
                    return (
                        <div
                            key={input.id}
                            className={`govuk-form-group${errorId !== '' ? ' govuk-form-group--error' : ''}`}
                        >
                            <label className="govuk-label" htmlFor={input.id}>
                                {input.label}
                            </label>
                            <FormElementWrapper
                                errors={fieldset.inputErrors}
                                errorId={errorId}
                                errorClass="govuk-input--error"
                            >
                                <input
                                    className="govuk-input govuk-input--width-2"
                                    id={input.id}
                                    name={input.name}
                                    type="text"
                                    defaultValue={
                                        fieldset.inputErrors.find((inputError) => inputError.id === input.id)
                                            ? fieldset.inputErrors.find((inputError) => inputError.id === input.id)
                                                  ?.userInput
                                            : ''
                                    }
                                />
                            </FormElementWrapper>
                        </div>
                    );
                })}
            </fieldset>
            <br />
            <br />
        </div>
    );
};

const DefinePassengerType = ({
    group,
    errors = [],
    fieldsets,
    numberOfPassengerTypeFieldset,
    csrfToken,
    groupPassengerType,
}: DefinePassengerTypeProps & CustomAppProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} errors={errors}>
        <CsrfForm action="/api/definePassengerType" method="post" csrfToken={csrfToken}>
            <>
                <ErrorSummary errors={errors} />
                <div>
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                        <h1 className="govuk-fieldset__heading" id="define-passenger-type-page-heading">
                            Provide passenger type details
                        </h1>
                    </legend>
                    {group === false ? (
                        <span className="govuk-hint" id="define-passenger-type-hint">
                            Select if the passenger type requires an age range or proof document
                        </span>
                    ) : (
                        ''
                    )}
                    <br />
                    <br />
                    {group === true && numberOfPassengerTypeFieldset
                        ? numberOfPassengerTypeQuestion(numberOfPassengerTypeFieldset)
                        : ''}
                    {fieldsets.map((fieldset) => {
                        return <RadioConditionalInput key={fieldset.heading.id} fieldset={fieldset} />;
                    })}
                </div>
                {group === true && <input value={groupPassengerType} type="hidden" name="groupPassengerType" />}
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const isGroupDefinitionWithErrors = (
    groupDefinition: GroupDefinition | GroupDefinitionWithErrors,
): groupDefinition is GroupDefinitionWithErrors => (groupDefinition as GroupDefinitionWithErrors).errors.length > 0;

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: DefinePassengerTypeProps } => {
    const cookies = parseCookies(ctx);
    const passengerTypeCookie = cookies[PASSENGER_TYPE_COOKIE];

    const groupPassengerTypes = getSessionAttribute(ctx.req, GROUP_PASSENGER_TYPES_ATTRIBUTE);

    if (!passengerTypeCookie && !groupPassengerTypes) {
        throw new Error('Failed to retrieve passenger type details for the define passenger type page');
    }

    const errors: ErrorInfo[] =
        passengerTypeCookie && JSON.parse(passengerTypeCookie).errors ? JSON.parse(passengerTypeCookie).errors : [];
    let fieldsets: RadioConditionalInputFieldset[];
    let numberOfPassengerTypeFieldset: TextInputFieldset;

    const group = !!groupPassengerTypes;

    if (group) {
        const groupPassengerType = ctx.query.groupPassengerType as string;
        fieldsets = getFieldsets(errors, groupPassengerType);
        numberOfPassengerTypeFieldset = getNumberOfPassengerTypeFieldset(errors, groupPassengerType);

        return {
            props: {
                group,
                errors,
                fieldsets,
                numberOfPassengerTypeFieldset,
                groupPassengerType,
            },
        };
    }
    fieldsets = getFieldsets(errors);

    return { props: { group, errors, fieldsets } };
};

export default DefinePassengerType;
