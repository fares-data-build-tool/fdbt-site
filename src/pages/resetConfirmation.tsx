import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import { BaseLayout } from '../layout/Layout';
import ErrorSummary from '../components/ErrorSummary';
import { FORGOT_PASSWORD_COOKIE } from '../constants';

const title = 'Reset Email Confirmation - Fares data build tool';
const description = 'Reset Email Confirmation page of the Fares data build tool';

interface ResetConfirmationProps {
    email: string;
}

const ResetConfirmation = ({ email }: ResetConfirmationProps): ReactElement => {
    return (
        <BaseLayout title={title} description={description} errors={[]}>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <form action="/api/forgotPassword" method="post">
                        <ErrorSummary errors={[]} />
                        <div className="govuk-form-group">
                            <div className="govuk-fieldset" aria-describedby="register-page-heading">
                                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                    <h1 className="govuk-fieldset__heading" id="register-type-page-heading">
                                        Reset password link has been sent
                                    </h1>
                                </legend>
                            </div>
                            <p className="govuk-body">
                                If this email address exists in our system, we will send a password reset email to
                                <b>{' ' + email}</b>.
                            </p>
                            <p className="govuk-body">Check your email and follow the link within 24 hours to reset your
                                password.</p>
                            <p className="govuk-body">If you cannot find the email then look in your spam or junk email folder.</p>
                        </div>
                        <a
                            href="/operator"
                            role="button"
                            draggable="false"
                            className="govuk-button"
                            data-module="govuk-button"
                        >
                            Home
                        </a>
                    </form>
                </div>
            </div>
        </BaseLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): { props: ResetConfirmationProps } => {
    const cookies = parseCookies(ctx);
    const forgotPasswordCookie = cookies[FORGOT_PASSWORD_COOKIE];

    const forgotPasswordInfo = JSON.parse(forgotPasswordCookie);

    const { email } = forgotPasswordInfo;

    return { props: { email } };
};

export default ResetConfirmation;
