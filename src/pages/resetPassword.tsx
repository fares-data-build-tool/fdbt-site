import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import { BaseLayout } from '../layout/Layout';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import { USER_COOKIE } from '../constants';
import { ErrorInfo } from '../types';
import { redirectTo } from './api/apiUtils';

const title = 'Create Account - Fares data build tool';
const description = 'Create Account page of the Fares data build tool';

export interface InputCheck {
    id: string;
    inputValue: string;
    error: string;
}

interface ResetPasswordProps {
    errors: ErrorInfo[];
    regKey: string;
    username: string;
}

const ResetPassword = ({ errors, regKey, username }: ResetPasswordProps): ReactElement => {
    return (
        <BaseLayout title={title} description={description} errors={errors}>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <form action="/api/resetPassword" method="post">
                        <ErrorSummary errors={errors} />
                        <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                            <div className="govuk-fieldset" aria-describedby="resetPassword-page-heading">
                                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                    <h1 className="govuk-fieldset__heading" id="resetPassword-type-page-heading">
                                        Reset your password
                                    </h1>
                                </legend>
                                <p className="govuk-hint hint-text">
                                    Your password should be at least 8 characters long.
                                </p>
                                <div className="govuk-form-group">
                                    <label className="govuk-label" htmlFor="password">
                                        New password
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

                                <div className="govuk-form-group">
                                    <label className="govuk-label" htmlFor="confirmPassword">
                                        Confirm your new password
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
                            </div>
                        </div>
                        <input
                            type="submit"
                            name="resetPassword"
                            value="Reset Password"
                            id="reset-password-button"
                            className="govuk-button"
                        />
                        <input value={regKey} type="hidden" name="regKey" />
                        <input value={username} type="hidden" name="username" />
                    </form>
                </div>
            </div>
        </BaseLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): {} => {
    const cookies = parseCookies(ctx);
    const userCookie = cookies[USER_COOKIE];

    const errors: ErrorInfo[] = [];

    // eslint-disable-next-line camelcase,@typescript-eslint/camelcase
    const { key, user_name: username, expiry } = ctx.query;

    if ((!key || !username || !expiry) && ctx.res) {
        redirectTo(ctx.res, '/resetError');
    }

    if (expiry) {
        if (typeof expiry === 'string') {
            const parsedExpiry = parseInt(expiry, 10);
            const currentTimeStamp = Math.floor(Date.now() / 1000);
            const timeDifference = currentTimeStamp - parsedExpiry;

            if (timeDifference >= 3600) {
                if (ctx.res) {
                    redirectTo(ctx.res, '/resetError');
                }
            }
        }
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

        return { props: { inputChecks, errors, regKey: key, username } };
    }

    return { props: { errors, regKey: key, username } };
};

export default ResetPassword;