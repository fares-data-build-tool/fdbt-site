import React, { ReactElement } from 'react';
import { ErrorInfo, CustomAppProps, NextContextWithSession } from '../interfaces';
import { BaseLayout } from '../layout/Layout';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import { FORGOT_PASSWORD_ATTRIBUTE } from '../constants';
import CsrfForm from '../components/CsrfForm';
import { getSessionAttributes } from '../utils/sessions';

const title = 'Forgot Password - Fares data build tool';
const description = 'Forgot Password page of the Fares data build tool';
const id = 'email';

interface ForgotEmailProps {
    email: string;
    errors: ErrorInfo[];
}

const ForgotPassword = ({ email, errors = [], csrfToken }: ForgotEmailProps & CustomAppProps): ReactElement => (
    <BaseLayout title={title} description={description} errors={errors}>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
                <CsrfForm action="/api/forgotPassword" method="post" csrfToken={csrfToken}>
                    <>
                        <ErrorSummary errors={errors} />
                        <div className="govuk-form-group">
                            <div className="govuk-fieldset" aria-describedby="forgot-password-heading">
                                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                    <h1 className="govuk-fieldset__heading" id="forgot-password-heading">
                                        Forgot your Password?
                                    </h1>
                                </legend>
                                <p className="govuk-hint hint-text" id="hint-text">
                                    Enter your email address to reset your password
                                </p>
                                <label className="govuk-label govuk-visually-hidden" htmlFor="email">
                                    Enter email address
                                </label>
                                <div className="govuk-form-group">
                                    <FormElementWrapper errors={errors} errorId={id} errorClass="govuk-input--error">
                                        <input
                                            className="govuk-input"
                                            id="email"
                                            name="email"
                                            type="text"
                                            aria-describedby="hint-text"
                                            autoComplete="email"
                                            spellCheck="false"
                                            defaultValue={email}
                                        />
                                    </FormElementWrapper>
                                </div>
                            </div>
                        </div>
                        <input
                            type="submit"
                            name="continue"
                            value="Continue"
                            id="continue-button"
                            className="govuk-button"
                        />
                    </>
                </CsrfForm>
            </div>
            <div className="govuk-grid-column-one-third">
                <p>
                    <h1 className="govuk-heading-s">Don&#39;t have an account?</h1>
                    <a href="/register" className="govuk-link">
                        Request Access
                    </a>
                </p>
            </div>
        </div>
    </BaseLayout>
);

export const getServerSideProps = (ctx: NextContextWithSession): { props: ForgotEmailProps } => {
    if (ctx.req) {
        const { email, error } = getSessionAttributes(ctx.req, [FORGOT_PASSWORD_ATTRIBUTE]);

        if (email && error) {
            return { props: { errors: [{ errorMessage: error, id }], email } };
        }

        if (error) {
            return { props: { errors: [{ errorMessage: error, id }], email: '' } };
        }
    }

    return { props: { errors: [], email: '' } };
};

export default ForgotPassword;
