import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import Layout from '../layout/Layout';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import { USER_COOKIE } from '../constants';
import { ErrorInfo } from '../types';

const title = 'Create Account - Fares data build tool';
const description = 'Create Account page of the Fares data build tool';

export interface InputCheck {
    error: string;
    inputValue: string;
    id: string;
}

interface RegisterProps {
    inputChecks: InputCheck[];
    errors: ErrorInfo[];
}

const Register = ({ inputChecks, errors }: RegisterProps): ReactElement => {
    let email = '';
    let nocCode = '';

    inputChecks.forEach((input: InputCheck) => {
        if (input.id === 'email') {
            email = input.inputValue;
        } else if (input.id === 'nocCode') {
            nocCode = input.inputValue;
        }
    });

    return (
        <Layout title={title} description={description}>
            <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <form action="/api/register" method="post">
                            <ErrorSummary errors={errors} />
                            <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                                <div className="govuk-fieldset" aria-describedby="register-page-heading">
                                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                        <h1 className="govuk-fieldset__heading" id="register-type-page-heading">
                                            Create an account
                                        </h1>
                                    </legend>
                                    <p className="govuk-hint hint-text">Enter your details to create an account</p>
                                    <div className="govuk-form-group">
                                        <label className="govuk-label" htmlFor="email">
                                            Create an Email address
                                        </label>
                                        <FormElementWrapper
                                            errors={errors}
                                            errorId="email"
                                            errorClass="govuk-input--error"
                                        >
                                            <input
                                                className="govuk-input"
                                                id="email"
                                                name="email"
                                                type="email"
                                                aria-describedby="email-hint"
                                                autoComplete="email"
                                                spellCheck="false"
                                                defaultValue={email}
                                            />
                                        </FormElementWrapper>
                                    </div>

                                    <div className="govuk-form-group">
                                        <label className="govuk-label" htmlFor="password">
                                            Create a Password
                                        </label>
                                        <span id="password-hint" className="govuk-hint">
                                            Your password should be at least 8 characters long.
                                        </span>
                                        <FormElementWrapper
                                            errors={errors}
                                            errorId="password"
                                            errorClass="govuk-input--error"
                                        >
                                            <input
                                                className="govuk-input"
                                                id="password"
                                                name="password"
                                                type="password"
                                                aria-describedby="password-hint"
                                                spellCheck="false"
                                            />
                                        </FormElementWrapper>
                                    </div>

                                    <div className="govuk-form-group">
                                        <label className="govuk-label" htmlFor="confirmPassword">
                                            Confirm your password
                                        </label>
                                        <input
                                            className="govuk-input"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            aria-describedby="confirmPassword-hint"
                                            spellCheck="false"
                                        />
                                    </div>
                                    <div className="govuk-form-group">
                                        <label className="govuk-label" htmlFor="nocCode">
                                            Enter a NOC code
                                        </label>
                                        <FormElementWrapper
                                            errors={errors}
                                            errorId="nocCode"
                                            errorClass="govuk-input--error"
                                        >
                                            <input
                                                className="govuk-input"
                                                id="nocCode"
                                                name="nocCode"
                                                type="text"
                                                aria-describedby="nocCode-hint"
                                                spellCheck="false"
                                                defaultValue={nocCode}
                                            />
                                        </FormElementWrapper>
                                    </div>
                                    <p className="govuk-body govuk-!-margin-top-5">
                                        By using this website, you agree to the&nbsp;
                                        <a href="https://www.gov.uk/help/privacy-notice" className="govuk-link">
                                            Privacy
                                        </a>
                                        &nbsp;and&nbsp;
                                        <a href="https://www.gov.uk/help/cookies" className="govuk-link">
                                            Cookies
                                        </a>
                                        &nbsp;policies
                                    </p>
                                    <div className="govuk-checkboxes">
                                        <div className="govuk-checkboxes__item">
                                            <input
                                                className="govuk-checkboxes__input"
                                                id="checkbox-user-research"
                                                name="checkbox-user-research"
                                                type="checkbox"
                                                value="checkUserResearch"
                                            />
                                            <label
                                                className="govuk-label govuk-checkboxes__label"
                                                htmlFor="checkbox-user-research"
                                            >
                                                If you are willing to be contacted as part of user research, please tick
                                                this box.
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <input
                                type="submit"
                                name="createAccount"
                                value="Create account"
                                id="create-account-button"
                                className="govuk-button"
                            />
                        </form>
                    </div>
                    <div className="govuk-grid-column-one-thirds">
                        <h3 className="govuk-heading-m">Already have an account?</h3>
                        <a href="/signin" className="govuk-link">
                            Sign in
                        </a>
                    </div>
                </div>
            </main>
        </Layout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): {} => {
    const cookies = parseCookies(ctx);
    const userCookie = cookies[USER_COOKIE];

    const errors: ErrorInfo[] = [];

    if (userCookie) {
        const userCookieParsed = JSON.parse(userCookie);
        const { inputChecks } = userCookieParsed;

        inputChecks.map((check: InputCheck) => {
            if (check.error) {
                errors.push({ id: check.id, errorMessage: check.error });
            }
            return errors;
        });

        return { props: { inputChecks, errors } };
    }

    return { props: { errors } };
};

export default Register;