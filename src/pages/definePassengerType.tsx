import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import TwoThirdsLayout from '../layout/Layout';
import { PASSENGER_TYPE_COOKIE } from '../constants';
import ErrorSummary from '../components/ErrorSummary';
import RadioConditionalInput, { RadioConditionalInputFieldset } from '../components/RadioConditionalInput';
import { ErrorInfo, CustomAppProps } from '../interfaces';
import CsrfForm from '../components/CsrfForm';

const title = 'Define Passenger Type - Fares Data Build Tool';
const description = 'Define Passenger Type page of the Fares Data Build Tool';

export interface ErrorCollection {
    combinedErrors: ErrorInfo[];
    ageRangeRadioError: ErrorInfo[];
    proofSelectRadioError: ErrorInfo[];
    ageRangeInputErrors: ErrorInfo[];
    proofSelectInputError: ErrorInfo[];
}

export interface DefinePassengerTypeProps {
    errors: ErrorInfo[];
    fieldsets: RadioConditionalInputFieldset[];
}

export const getErrorsByIds = (ids: string[], errors: ErrorInfo[]): ErrorInfo[] => {
    const compactErrors: ErrorInfo[] = [];
    errors.forEach(error => {
        if (ids.includes(error.id)) {
            compactErrors.push(error);
        }
    });
    return compactErrors;
};

export const getFieldsets = (errors: ErrorInfo[]): RadioConditionalInputFieldset[] => {
    const fieldsets = [];

    const ageRangeFieldset: RadioConditionalInputFieldset = {
        heading: {
            id: 'define-passenger-age-range',
            content: 'Does the passenger type have an age range?',
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
            content: 'Does the passenger type require a proof document?',
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
    fieldsets.push(ageRangeFieldset, proofRequiredFieldset);
    return fieldsets;
};

const DefinePassengerType = ({
    errors = [],
    fieldsets,
    csrfToken,
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
                    <span className="govuk-hint" id="define-passenger-type-hint">
                        Select if the passenger type requires an age range or proof document
                    </span>
                    <br />
                    <br />
                    {fieldsets.map(fieldset => {
                        return <RadioConditionalInput key={fieldset.heading.id} fieldset={fieldset} />;
                    })}
                </div>
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContext): { props: DefinePassengerTypeProps } => {
    const cookies = parseCookies(ctx);
    const passengerTypeCookie = cookies[PASSENGER_TYPE_COOKIE];

    if (!passengerTypeCookie) {
        throw new Error('Failed to retrieve PASSENGER_TYPE_COOKIE for the define passenger type page');
    }

    let errors: ErrorInfo[] = [];

    const parsedPassengerTypeCookie = JSON.parse(passengerTypeCookie);
    if (parsedPassengerTypeCookie.errors) {
        errors = parsedPassengerTypeCookie.errors;
    }
    const fieldsets: RadioConditionalInputFieldset[] = getFieldsets(errors);

    return { props: { errors, fieldsets } };
};

export default DefinePassengerType;
