import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import Layout from '../layout/Layout';
import { PERIOD_TYPE } from '../constants';
import { ErrorInfo } from '../types';
import { buildTitle } from '../utils';
import ErrorSummary from '../components/ErrorSummary';

const title = 'Period Type - Fares data build tool';
const description = 'Period Type selection page of the Fares data build tool';

type PeriodTypeProps = {
    errors: ErrorInfo[];
};

const PeriodType = ({ errors = [] }: PeriodTypeProps): ReactElement => {
    return (
        <Layout title={buildTitle(errors, title)} description={description}>
            <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
                <form action="/api/periodType" method="post">
                    <ErrorSummary errors={errors} />
                    <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <fieldset className="govuk-fieldset" aria-describedby="periodtype-page-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                <h1 className="govuk-fieldset__heading" id="periodtype-page-heading">
                                    What type of Period Ticket?
                                </h1>
                            </legend>
                            {errors.length > 0 && (
                                <span id="operator-error" className="govuk-error-message error-message-padding">
                                    <span>{errors[0].errorMessage}</span>
                                </span>
                            )}
                            <div className="govuk-radios">
                                <div className="govuk-radios__item">
                                    <input
                                        className={`govuk-radios__input ${
                                            errors.length > 0 ? 'govuk-input--error' : ''
                                        } `}
                                        id="periodtype-geo-zone"
                                        name="periodType"
                                        type="radio"
                                        value="periodGeoZone"
                                    />
                                    <label className="govuk-label govuk-radios__label" htmlFor="periodtype-geo-zone">
                                        A ticket within a geographical zone
                                    </label>
                                </div>
                                <div className="govuk-radios__item">
                                    <input
                                        className={`govuk-radios__input ${
                                            errors.length > 0 ? 'govuk-input--error' : ''
                                        } `}
                                        id="periodtype-single-set-service"
                                        name="periodType"
                                        type="radio"
                                        value="periodMultipleServices"
                                    />
                                    <label
                                        className="govuk-label govuk-radios__label"
                                        htmlFor="periodtype-single-set-service"
                                    >
                                        A ticket for some or all of your network of services
                                    </label>
                                </div>
                                <div className="govuk-radios__item">
                                    <input
                                        className={`govuk-radios__input ${
                                            errors.length > 0 ? 'govuk-input--error' : ''
                                        } `}
                                        id="periodtype-network"
                                        name="periodType"
                                        type="radio"
                                        value="periodMultipleOperators"
                                        disabled
                                        aria-disabled="true"
                                    />
                                    <label className="govuk-label govuk-radios__label" htmlFor="periodtype-network">
                                        A ticket for services across multiple operators
                                    </label>
                                </div>
                            </div>
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

    if (cookies[PERIOD_TYPE]) {
        const periodTypeCookie = unescape(decodeURI(cookies[PERIOD_TYPE]));
        const parsedPeriodTypeCookie = JSON.parse(periodTypeCookie);

        if (parsedPeriodTypeCookie.errorMessage) {
            const errors: ErrorInfo[] = [
                { errorMessage: parsedPeriodTypeCookie.errorMessage, errorHref: '#periodtype-page-heading' },
            ];
            return { props: { errors } };
        }
    }

    return { props: {} };
};

export default PeriodType;
