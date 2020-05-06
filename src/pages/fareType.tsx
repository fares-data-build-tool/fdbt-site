import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import Layout from '../layout/Layout';
import { FARETYPE_COOKIE } from '../constants';
import { ErrorInfo } from '../types';
import ErrorSummary from '../components/ErrorSummary';
import { deleteCookieOnServerSide, buildTitle, unescapeAndDecodeCookieServerSide } from '../utils/index';
import FormElementWrapper from '../components/FormElementWrapper';

const title = 'Fare Type - Fares Data Build Tool';
const description = 'Fare Type selection page of the Fares Data Build Tool';

const errorId = 'fare-type-error';

type FareTypeProps = {
    errors: ErrorInfo[];
};

const FareType = ({ errors = [] }: FareTypeProps): ReactElement => {
    return (
        <Layout title={buildTitle(errors, title)} description={description}>
            <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
                <form action="/api/fareType" method="post">
                    <ErrorSummary errors={errors} />
                    <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <fieldset className="govuk-fieldset" aria-describedby="fare-type-page-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                <h1 className="govuk-fieldset__heading" id="fare-type-page-heading">
                                    What type of fare would you like to provide?
                                </h1>
                            </legend>
                            <FormElementWrapper errors={errors} errorId={errorId} errorClass="govuk-radios--error">
                                <div className="govuk-radios">
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="fare-type-single"
                                            name="fareType"
                                            type="radio"
                                            value="single"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="fare-type-single">
                                            Single - Point to Point
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="fare-type-period"
                                            name="fareType"
                                            type="radio"
                                            value="period"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="fare-type-period">
                                            Period Tickets
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="fare-type-return"
                                            name="fareType"
                                            type="radio"
                                            value="return"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="fare-type-return">
                                            Return - Single Service
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

    if (cookies[FARETYPE_COOKIE]) {
        const fareTypeCookie = unescapeAndDecodeCookieServerSide(cookies, FARETYPE_COOKIE);
        const parsedFareTypeCookie = JSON.parse(fareTypeCookie);

        if (parsedFareTypeCookie.errorMessage) {
            const { errorMessage } = parsedFareTypeCookie;
            deleteCookieOnServerSide(ctx, FARETYPE_COOKIE);
            return { props: { errors: [{ errorMessage, id: errorId }] } };
        }
    }

    return { props: {} };
};

export default FareType;
