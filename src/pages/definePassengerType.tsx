import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import Layout from '../layout/Layout';
import { PASSENGER_TYPE_COOKIE } from '../constants';
import ErrorSummary from '../components/ErrorSummary';
import { buildTitle, unescapeAndDecodeCookieServerSide } from '../utils/index';
import RadioConditionalInput, { RadioConditionalInputFieldset } from '../components/RadioConditionalInput';
import { ExtractedValidationError } from './api/definePassengerType';
import { ErrorInfo } from '../types';

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
    combinedErrors: ErrorInfo[];
    fieldsets: RadioConditionalInputFieldset[];
}

export const getFieldsets = (collectedErrors: ErrorCollection): RadioConditionalInputFieldset[] => {
    const fieldsetParams = [
        {
            type: 'ageRange',
            conditionalInputs: ['min', 'max'],
            inputErrors: collectedErrors.ageRangeInputErrors,
            radioError: collectedErrors.ageRangeRadioError,
        },
        {
            type: 'proof',
            conditionalInputs: ['membership-card', 'student-card', 'identity-document'],
            inputErrors: collectedErrors.proofSelectInputError,
            radioError: collectedErrors.proofSelectRadioError,
        },
    ];
    const fieldsets = fieldsetParams.map(fieldset => ({
        heading: {
            id: `define-passenger-${fieldset.type === 'ageRange' ? 'age-range' : 'proof'}`,
            content: `Does the passenger type ${
                fieldset.type === 'ageRange' ? 'have an age range' : 'require a proof document'
            }?`,
        },
        radios: [
            {
                id: `${fieldset.type === 'ageRange' ? 'age-range' : 'proof'}-required`,
                name: `${fieldset.type}`,
                value: 'yes',
                dataAriaControls: `${fieldset.type === 'ageRange' ? 'age-range' : 'proof'}-required-conditional`,
                label: 'Yes',
                hint: {
                    id: `define-passenger-${fieldset.type === 'ageRange' ? 'age-range' : 'proof'}-hint`,
                    content: `${
                        fieldset.type === 'ageRange'
                            ? 'Enter a minimum and/or maximum age for this passenger type.'
                            : 'Select the applicable proof document(s).'
                    }`,
                },
                inputType: `${fieldset.type === 'ageRange' ? 'text' : 'checkbox'}`,
                inputs: fieldset.conditionalInputs.map(input => ({
                    id: `${input === 'min' ? 'age-range-min' : 'age-range-max'}`,
                    name: `${input === 'min' ? 'ageRangeMin' : 'ageRangeMax'}`,
                    label: `${input === 'min' ? 'Minimum Age (if applicable)' : 'Maximum Age (if applicable)'}`,
                })),
                inputErrors: fieldset.inputErrors,
            },
            {
                id: `${fieldset.type === 'ageRange' ? 'age-range' : 'proof'}-not-required`,
                name: `${fieldset.type}`,
                value: 'no',
                label: 'No',
            },
        ],
        radioError: fieldset.radioError,
    }));

    return fieldsets;
};

export const collectErrors = (error: ExtractedValidationError, collectedErrors: ErrorCollection): void => {
    switch (error.input) {
        case 'ageRange':
            collectedErrors.ageRangeRadioError.push({
                errorMessage: error.message,
                id: 'define-passenger-age-range',
            });
            break;
        case 'proof':
            collectedErrors.proofSelectRadioError.push({
                errorMessage: error.message,
                id: 'define-passenger-proof',
            });
            break;
        case 'ageRangeMin':
            collectedErrors.ageRangeInputErrors.push({
                errorMessage: error.message,
                id: 'define-passenger-age-range',
            });
            break;
        case 'ageRangeMax':
            collectedErrors.ageRangeInputErrors.push({
                errorMessage: error.message,
                id: 'define-passenger-age-range',
            });
            break;
        case 'proofDocuments':
            collectedErrors.proofSelectInputError.push({
                errorMessage: error.message,
                id: 'define-passenger-proof',
            });
            break;
        default:
            throw new Error('Could not match the following error with an expected input.');
    }
};

const DefinePassengerType = ({ combinedErrors = [], fieldsets }: DefinePassengerTypeProps): ReactElement => {
    return (
        <Layout title={buildTitle(combinedErrors, title)} description={description}>
            <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
                <form action="/api/definePassengerType" method="post">
                    <ErrorSummary errors={combinedErrors} />
                    <div>
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
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
                            return <RadioConditionalInput fieldset={fieldset} />;
                        })}
                    </div>
                    <input
                        type="submit"
                        value="Continue"
                        id="continue-button"
                        className="govuk-button govuk-button--start"
                    />
                </form>
            </main>
        </Layout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): { props: DefinePassengerTypeProps } => {
    const cookies = parseCookies(ctx);
    const passengerTypeCookie = unescapeAndDecodeCookieServerSide(cookies, PASSENGER_TYPE_COOKIE);

    if (!passengerTypeCookie) {
        throw new Error('Failed to retrieve PASSENGER_TYPE_COOKIE for the define passenger type page');
    }

    const collectedErrors: ErrorCollection = {
        combinedErrors: [],
        ageRangeRadioError: [],
        proofSelectRadioError: [],
        ageRangeInputErrors: [],
        proofSelectInputError: [],
    };

    const parsedPassengerTypeCookie = JSON.parse(passengerTypeCookie);
    if (parsedPassengerTypeCookie.errors) {
        parsedPassengerTypeCookie.errors.forEach((error: ExtractedValidationError) =>
            collectErrors(error, collectedErrors),
        );
        collectedErrors.combinedErrors = collectedErrors.ageRangeRadioError.concat(
            collectedErrors.proofSelectRadioError,
            collectedErrors.ageRangeInputErrors,
            collectedErrors.proofSelectInputError,
        );
    }
    const fieldsets: RadioConditionalInputFieldset[] = getFieldsets(collectedErrors);

    return { props: { combinedErrors: collectedErrors.combinedErrors, fieldsets } };
};

export default DefinePassengerType;
