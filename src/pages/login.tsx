import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import Layout from '../layout/Layout';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import { USER_COOKIE } from '../constants';
import { ErrorInfo } from '../types';
import { redirectTo } from './api/apiUtils';

const title = 'Login - Fares data build tool';
const description = 'Login page of the Fares data build tool';

export interface InputCheck {
    id: string;
    inputValue: string;
    error: string;
}

interface LoginProps {
    inputChecks: InputCheck[];
    errors: ErrorInfo[];
    regKey: string;
}

const Login = ({ inputChecks, errors, regKey }: LoginProps): ReactElement => {
    let email = '';

    inputChecks?.forEach((input: InputCheck) => {
        if (input.id === 'email') {
            email = input.inputValue;
        }
    });

    return (
        <Layout title={title} description={description}>
            <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <form action="/api/login" method="post">
                            <ErrorSummary errors={errors} />
                            <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                                <div className="govuk-fieldset" aria-describedby="register-page-heading">
                                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                        <h1 className="govuk-fieldset__heading" id="register-type-page-heading">
                                            Sign in
                                        </h1>
                                    </legend>
                                    <p className="govuk-hint hint-text">
                                        Enter Fares Data Build Tool account details to sign in
                                    </p>
                                    <div className="govuk-form-group">
                                        <label className="govuk-label" htmlFor="email">
                                            Email
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
                                                type="text"
                                                aria-describedby="email-hint"
                                                autoComplete="email"
                                                spellCheck="false"
                                                defaultValue={email}
                                            />
                                        </FormElementWrapper>
                                    </div>

                                    <div className="govuk-form-group">
                                        <label className="govuk-label" htmlFor="password">
                                            Password
                                        </label>
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
                                </div>
                            </div>
                            <input
                                type="submit"
                                name="signIn"
                                value="Sign in"
                                id="sign-in-button"
                                className="govuk-button"
                            />
                            <input value={regKey} type="hidden" name="regKey" />
                        </form>
                    </div>
                    <div className="govuk-grid-column-one-third">
                        <p>
                            <h1 className="govuk-heading-s">Forgot your Password?</h1>
                            <a href="/forgottenPassword" className="govuk-link">
                                Reset your password
                            </a>
                        </p>
                        <br />
                        <p>
                            <h1 className="govuk-heading-s">Don&apos;t have an account?</h1>
                            <a href="/register" className="govuk-link">
                                Request access
                            </a>
                        </p>
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

    const { key } = ctx.query;

    if (!key && ctx.res) {
        redirectTo(ctx.res, '/requestAccess');
    }

    if (userCookie) {
        const userCookieParsed = JSON.parse(userCookie);
        const { inputChecks } = userCookieParsed;

        inputChecks.map((check: InputCheck) => {
            if (check.error) {
                errors.push({ id: check.id, errorMessage: check.error });
            }
            return errors;
        });

        return { props: { inputChecks, errors, regKey: key } };
    }

    return { props: { errors, regKey: key } };
};

export default Login;
