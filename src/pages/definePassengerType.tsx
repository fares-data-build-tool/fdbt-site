import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import Layout from '../layout/Layout';
import { USER_TYPE_COOKIE } from '../constants';
import { ErrorInfo } from '../types';
import ErrorSummary from '../components/ErrorSummary';
import { deleteCookieOnServerSide, buildTitle, unescapeAndDecodeCookieServerSide } from '../utils/index';
import RadioConditionalInput, { RadioConditionalInputFieldset } from '../components/RadioConditionalInput';

const title = 'Define Passenger Type - Fares Data Build Tool';
const description = 'Define Passenger Type page of the Fares Data Build Tool';

const errorId = 'define-passenger-type-error';

type DefinePassengerTypeProps = {
    errors: ErrorInfo[];
    fieldsets: RadioConditionalInputFieldset[];
};

export const getFieldsets = (): RadioConditionalInputFieldset[] => {
    const fieldsets = [];

    const ageRangeFieldset: RadioConditionalInputFieldset = {
        heading: {
            id: 'define-passenger-age-range',
            content: 'Does your user type have an age range?',
        },
        radios: [
            {
                id: 'age-range-required',
                name: 'ageRange',
                value: 'yes',
                dataAriaControls: 'age-range-required-conditional',
                label: 'Yes',
                hint: {
                    id: 'define-passenger-age-range-hint',
                    content: 'Enter a minimum and/or maximum age for this user type.',
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
            },
            {
                id: 'age-range-not-required',
                name: 'ageRange',
                value: 'no',
                label: 'No',
            },
        ],
    };

    const proofRequiredFieldset: RadioConditionalInputFieldset = {
        heading: {
            id: 'define-passenger-proof',
            content: 'Does your user type need a type of proof?',
        },
        radios: [
            {
                id: 'proof-required',
                name: 'proof',
                value: 'yes',
                dataAriaControls: 'proof-required-conditional',
                label: 'Yes',
                hint: {
                    id: 'define-passenger-proof-hint',
                    content: 'Select all that apply',
                },
                inputType: 'checkbox',
                inputs: [
                    {
                        id: 'identity-document',
                        name: 'membershipCard',
                        label: 'Membership Card',
                    },
                    {
                        id: 'student-card',
                        name: 'studentCard',
                        label: 'Student Card',
                    },
                    {
                        id: 'identity-document',
                        name: 'identityDocument',
                        label: 'Identity Document',
                    },
                ],
            },
            {
                id: 'proof-not-required',
                name: 'proof',
                value: 'no',
                label: 'No',
            },
        ],
    };
    fieldsets.push(ageRangeFieldset, proofRequiredFieldset);
    return fieldsets;
};

const DefinePassengerType = ({ errors = [], fieldsets }: DefinePassengerTypeProps): ReactElement => {
    return (
        <Layout title={buildTitle(errors, title)} description={description}>
            <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
                <form action="/api/definePassengerType" method="post">
                    <ErrorSummary errors={errors} />
                    <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                            <h1 className="govuk-fieldset__heading" id="define-passenger-type-page-heading">
                                Which user group does this fare apply to?
                            </h1>
                        </legend>
                        <span className="govuk-hint" id="define-passenger-type-hint">
                            Tell us whether this fare has an applicable age range or proof requirement. Example: A
                            student ticket may be available for someone between the ages of 13 and 18 and require a
                            student ID card.
                        </span>
                        <br />
                        <br />
                        {fieldsets.map(fieldset => {
                            return <RadioConditionalInput errors={errors} errorId={errorId} fieldset={fieldset} />;
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

export const getServerSideProps = (ctx: NextPageContext): {} => {
    const cookies = parseCookies(ctx);

    const fieldsets = getFieldsets();
    let errors: ErrorInfo[] = [];

    if (cookies[USER_TYPE_COOKIE]) {
        const userTypeCookie = unescapeAndDecodeCookieServerSide(cookies, USER_TYPE_COOKIE);
        const parsedUserTypeCookie = JSON.parse(userTypeCookie);
        errors = parsedUserTypeCookie.errors.map((error: any) => ({
            errorId: error.errorId,
            errorMessage: error.errorMessage,
        }));

        if (parsedUserTypeCookie.errorMessage) {
            const { errorMessage } = parsedUserTypeCookie;
            deleteCookieOnServerSide(ctx, USER_TYPE_COOKIE);
            return { props: { errors: [{ errorMessage, id: errorId }], fieldsets } };
        }
    }

    return { props: { errors, fieldsets } };
};

export default DefinePassengerType;
