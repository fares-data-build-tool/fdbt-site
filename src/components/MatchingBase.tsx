import React, { ReactElement } from 'react';
import ErrorSummary from './ErrorSummary';
import FormElementWrapper from './FormElementWrapper';
import Layout from '../layout/Layout';
import MatchingList from './MatchingList';
import { UserFareStages } from '../data/s3';
import { Stop } from '../data/auroradb';
import { BasicService } from '../interfaces';
import { ErrorInfo } from '../types';

interface MatchingBaseProps {
    userFareStages: UserFareStages;
    stops: Stop[];
    service: BasicService;
    error: boolean;
    title: string;
    description: string;
    hintText: string;
    travelineHintText: string;
    heading: string;
    apiEndpoint: string;
}

const MatchingBase = ({
    userFareStages,
    stops,
    service,
    error,
    title,
    description,
    hintText,
    travelineHintText,
    heading,
    apiEndpoint,
}: MatchingBaseProps): ReactElement => {
    const errors: ErrorInfo[] = [];

    if (error) {
        errors.push({ errorMessage: 'Ensure each fare stage is assigned at least once.', id: 'dropdown-error' });
    }

    return (
        <Layout title={title} description={description}>
            <main className="govuk-main-wrapper app-main-class matching-page" id="main-content" role="main">
                <form action={apiEndpoint} method="post">
                    <ErrorSummary errors={errors} />
                    <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                            <h1 className="govuk-fieldset__heading">{heading}</h1>
                        </legend>
                        <span className="govuk-hint" id="match-fares-hint">
                            {hintText}
                        </span>
                        <span className="govuk-hint" id="traveline-hint">
                            {travelineHintText}
                        </span>
                        <FormElementWrapper errors={errors} errorId="dropdown-error" errorClass="">
                            <MatchingList userFareStages={userFareStages} stops={stops} />
                        </FormElementWrapper>
                    </div>

                    <input type="hidden" name="service" value={JSON.stringify(service)} />
                    <input type="hidden" name="userfarestages" value={JSON.stringify(userFareStages)} />
                    <input
                        type="submit"
                        value="Continue"
                        id="submit-button"
                        className="govuk-button govuk-button--start"
                    />
                </form>
            </main>
        </Layout>
    );
};

export default MatchingBase;
