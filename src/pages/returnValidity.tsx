import React, { ReactElement } from 'react';
import TwoThirdsLayout from '../layout/Layout';
import ErrorSummary from '../components/ErrorSummary';
import RadioConditionalInput, { RadioConditionalInputFieldset } from '../components/RadioConditionalInput';
import { ErrorInfo, CustomAppProps, NextPageContextWithSession } from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import { getSessionAttribute } from '../utils/sessions';
import { RETURN_VALIDITY_ATTRIBUTE } from '../constants';
import { getErrorsByIds } from '../utils';

const title = 'Return Validity - Fares Data Build Tool';
const description = 'Return Val page of the Fares Data Build Tool';

export interface ReturnValidity {
    validityAmount: string;
    validityDuration: string;
}

export interface ReturnValidityWithErrors extends ReturnValidity {
    errors: ErrorInfo[];
}

export interface ReturnValidityProps {
    errors: ErrorInfo[];
    fieldset: RadioConditionalInputFieldset;
}

export const getFieldset = (errors: ErrorInfo[]): RadioConditionalInputFieldset => ({
    heading: {
        id: 'define-return-validity',
        content: 'Is the return journey of this ticket only valid for a set period of time?',
        hidden: true,
    },
    radios: [
        {
            id: 'return-validity-defined',
            name: 'validity',
            value: 'Yes',
            dataAriaControls: 'return-validity-defined-conditional',
            label: 'Yes',
            hint: {
                id: 'define-return-validity-hint',
                content: 'Enter an amount, then select a duration from the dropdown',
            },
            inputType: 'textWithUnits',
            inputs: [
                {
                    id: 'return-validity-amount',
                    name: 'amount',
                    label: 'Amount',
                },
                {
                    id: 'return-validity-units',
                    name: 'duration',
                    label: 'Duration',
                    options: ['Days', 'Weeks', 'Months', 'Years'],
                },
            ],
            inputErrors: getErrorsByIds(['return-validity-amount', 'return-validity-units'], errors),
        },
        {
            id: 'return-validity-not-defined',
            name: 'validity',
            value: 'No',
            label: 'No',
        },
    ],
    radioError: getErrorsByIds(['define-return-validity'], errors),
});

export const isReturnValidityWithErrors = (
    returnValidityDefinition: ReturnValidity | ReturnValidityWithErrors,
): returnValidityDefinition is ReturnValidityWithErrors =>
    (returnValidityDefinition as ReturnValidityWithErrors).errors !== undefined;

const ReturnValidity = ({ errors = [], fieldset, csrfToken }: ReturnValidityProps & CustomAppProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} errors={errors}>
        <CsrfForm action="/api/returnValidity" method="post" csrfToken={csrfToken}>
            <>
                <ErrorSummary errors={errors} />
                <div>
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                        <h1 className="govuk-fieldset__heading" id="return-validity-page-heading">
                            {fieldset.heading.content}
                        </h1>
                    </legend>
                    <span className="govuk-hint" id="return-validity-hint">
                        If the return journey is valid indefinitely, select no.
                    </span>
                    <RadioConditionalInput key={fieldset.heading.id} fieldset={fieldset} />
                </div>
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: ReturnValidityProps } => {
    const returnValidity = getSessionAttribute(ctx.req, RETURN_VALIDITY_ATTRIBUTE);

    let errors: ErrorInfo[] = [];
    if (returnValidity && isReturnValidityWithErrors(returnValidity)) {
        errors = returnValidity.errors;
    }

    const fieldset: RadioConditionalInputFieldset = getFieldset(errors);
    return { props: { errors, fieldset } };
};

export default ReturnValidity;
