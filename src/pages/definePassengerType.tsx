import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import Layout from '../layout/Layout';
import { USER_TYPE_COOKIE } from '../constants';
import { ErrorInfo } from '../types';
import ErrorSummary from '../components/ErrorSummary';
import { deleteCookieOnServerSide, buildTitle, unescapeAndDecodeCookieServerSide } from '../utils/index';
import FormElementWrapper from '../components/FormElementWrapper';

const title = 'Define Passenger Type - Fares Data Build Tool';
const description = 'Define Passenger Type page of the Fares Data Build Tool';

const errorId = 'define-passenger-type-error';

type DefinePassengerTypeProps = {
    errors: ErrorInfo[];
};

const DefinePassengerType = ({ errors = [] }: DefinePassengerTypeProps): ReactElement => {
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
                        <fieldset className="govuk-fieldset" aria-describedby="define-passenger-age-range">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h2 className="govuk-fieldset__heading" id="define-passenger-age-range">
                                    Does your user type have an age range?
                                </h2>
                            </legend>
                            <span className="govuk-hint" id="define-passenger-age-range-hint">
                                Enter a minimum and/or maximum age for this user type.
                            </span>
                            <FormElementWrapper errors={errors} errorId={errorId} errorClass="govuk-radios--error">
                                <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="age-range-required"
                                            name="age-range"
                                            type="radio"
                                            value="yes"
                                            data-aria-controls="age-range-required-conditional-min"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="age-range-required">
                                            Yes
                                        </label>
                                    </div>
                                    <div
                                        className="govuk-radios__conditional govuk-radios__conditional--hidden"
                                        id="age-range-required-conditional-min"
                                    >
                                        <div className="govuk-form-group">
                                            <label className="govuk-label" htmlFor="age-range-min">
                                                Minimum Age (if applicable)
                                            </label>
                                            <input
                                                className="govuk-input govuk-!-width-one-third"
                                                id="age-range-min"
                                                name="age-range-min"
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                    <div
                                        className="govuk-radios__conditional govuk-radios__conditional--hidden"
                                        id="age-range-required-conditional-max"
                                    >
                                        <div className="govuk-form-group">
                                            <label className="govuk-label" htmlFor="age-range-max">
                                                Maximum Age (if applicable)
                                            </label>
                                            <input
                                                className="govuk-input govuk-!-width-one-third"
                                                id="age-range-max"
                                                name="age-range-max"
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="age-range-not-required"
                                            name="age-range"
                                            type="radio"
                                            value="no"
                                        />
                                        <label
                                            className="govuk-label govuk-radios__label"
                                            htmlFor="age-range-not-required"
                                        >
                                            No
                                        </label>
                                    </div>
                                </div>
                            </FormElementWrapper>
                        </fieldset>
                        <br />
                        <fieldset className="govuk-fieldset" aria-describedby="define-passenger-age-range">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h2 className="govuk-fieldset__heading" id="define-passenger-age-range">
                                    Does your user type have an age range?
                                </h2>
                            </legend>
                            <span className="govuk-hint" id="define-passenger-age-range-hint">
                                Enter a minimum and/or maximum age for this user type.
                            </span>
                            <FormElementWrapper errors={errors} errorId={errorId} errorClass="govuk-radios--error">
                                <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="age-range-required"
                                            name="age-range"
                                            type="radio"
                                            value="yes"
                                            data-aria-controls="age-range-required-conditional-min"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="age-range-required">
                                            Yes
                                        </label>
                                    </div>
                                    <div
                                        className="govuk-radios__conditional govuk-radios__conditional--hidden"
                                        id="age-range-required-conditional-min"
                                    >
                                        <div className="govuk-form-group">
                                            <label className="govuk-label" htmlFor="age-range-min">
                                                Minimum Age (if applicable)
                                            </label>
                                            <input
                                                className="govuk-input govuk-!-width-one-third"
                                                id="age-range-min"
                                                name="age-range-min"
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                    <div
                                        className="govuk-radios__conditional govuk-radios__conditional--hidden"
                                        id="age-range-required-conditional-max"
                                    >
                                        <div className="govuk-form-group">
                                            <label className="govuk-label" htmlFor="age-range-max">
                                                Maximum Age (if applicable)
                                            </label>
                                            <input
                                                className="govuk-input govuk-!-width-one-third"
                                                id="age-range-max"
                                                name="age-range-max"
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="age-range-not-required"
                                            name="age-range"
                                            type="radio"
                                            value="no"
                                        />
                                        <label
                                            className="govuk-label govuk-radios__label"
                                            htmlFor="age-range-not-required"
                                        >
                                            No
                                        </label>
                                    </div>
                                </div>
                            </FormElementWrapper>
                        </fieldset>
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

    if (cookies[USER_TYPE_COOKIE]) {
        const userTypeCookie = unescapeAndDecodeCookieServerSide(cookies, USER_TYPE_COOKIE);
        const parsedUserTypeCookie = JSON.parse(userTypeCookie);

        if (parsedUserTypeCookie.errorMessage) {
            const { errorMessage } = parsedUserTypeCookie;
            deleteCookieOnServerSide(ctx, USER_TYPE_COOKIE);
            return { props: { errors: [{ errorMessage, id: errorId }] } };
        }
    }

    return { props: {} };
};

export default DefinePassengerType;
