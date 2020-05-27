import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import Layout from '../layout/Layout';
import { ErrorInfo } from '../types';
import { NUMBER_OF_STAGES_COOKIE } from '../constants';
import { buildTitle, deleteCookieOnServerSide } from '../utils';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';

const title = 'How Many Stages - Fares Data Build Tool';
const description = 'How Many Stages selection page of the Fares Data Build Tool';

const errorId = 'how-many-stages-error';

interface HowManyStagesProps {
    errors: ErrorInfo[];
}

const HowManyStages = ({ errors = [] }: HowManyStagesProps): ReactElement => {
    return (
        <Layout title={buildTitle(errors, title)} description={description}>
            <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
                <form action="/api/howManyStages" method="post">
                    <ErrorSummary errors={errors} />
                    <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <fieldset className="govuk-fieldset" aria-describedby="number-of-stages-hint">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                <h1 className="govuk-fieldset__heading">How many fare stages does the service have?</h1>
                            </legend>
                            <span className="govuk-hint" id="number-of-stages-hint">
                                If the service has more than 20 fare stages you will be required to upload a csv file. A
                                template file is available if required.
                            </span>
                            <FormElementWrapper errors={errors} errorId={errorId} errorClass="govuk-radios--error">
                                <div className="govuk-radios" id="radio-buttons">
                                    <div className="govuk-radios__item">
                                        <input
                                            className={`govuk-radios__input ${
                                                errors.length > 0 ? 'govuk-input--error' : ''
                                            } `}
                                            id="lessThan20FareStages"
                                            name="howManyStages"
                                            type="radio"
                                            value="lessThan20"
                                        />
                                        <label
                                            className="govuk-label govuk-radios__label govuk-label--s"
                                            htmlFor="selection"
                                        >
                                            20 fare stages or less
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className={`govuk-radios__input ${
                                                errors.length > 0 ? 'govuk-input--error' : ''
                                            } `}
                                            id="moreThan20FareStages"
                                            name="howManyStages"
                                            type="radio"
                                            value="moreThan20"
                                        />
                                        <label
                                            className="govuk-label govuk-radios__label govuk-label--s"
                                            htmlFor="selection-2"
                                        >
                                            More than 20 fare stages
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

    if (cookies[NUMBER_OF_STAGES_COOKIE]) {
        const numberOfFareStagesCookie = cookies[NUMBER_OF_STAGES_COOKIE];
        const parsedNumberOfFareStagesCookie = JSON.parse(numberOfFareStagesCookie);

        if (parsedNumberOfFareStagesCookie.errorMessage) {
            const { errorMessage } = parsedNumberOfFareStagesCookie;
            deleteCookieOnServerSide(ctx, NUMBER_OF_STAGES_COOKIE);
            return { props: { errors: [{ errorMessage, id: errorId }] } };
        }
    }

    return { props: {} };
};

export default HowManyStages;
