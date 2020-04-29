import React, { ReactElement } from 'react';
import Layout from '../../layout/Layout';
import MatchingList from '../MatchingList';
import { UserFareStages } from '../../data/s3';
import { Stop } from '../../data/auroradb';
import { BasicService } from '../../pages/matching';

interface MatchingBaseProps {
    userFareStages: UserFareStages;
    stops: Stop[];
    service: BasicService;
    error: boolean;
    title: string;
    description: string;
    hintText: string;
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
    heading,
    apiEndpoint,
}: MatchingBaseProps): ReactElement => (
    <Layout title={title} description={description}>
        <main className="govuk-main-wrapper app-main-class matching-page" id="main-content" role="main">
            <form action={apiEndpoint} method="post">
                <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                        <h1 className="govuk-fieldset__heading">{heading}</h1>
                    </legend>
                    <span id="dropdown-error" className="govuk-error-message">
                        <span className={error ? '' : 'govuk-visually-hidden'}>
                            Ensure each fare stage is assigned at least once.
                        </span>
                    </span>
                    <span className="govuk-hint" id="match-fares-hint">
                        {hintText}
                    </span>
                    <MatchingList userFareStages={userFareStages} stops={stops} />
                </div>

                <input type="hidden" name="service" value={JSON.stringify(service)} />
                <input type="hidden" name="userfarestages" value={JSON.stringify(userFareStages)} />
                <input type="submit" value="Continue" id="submit-button" className="govuk-button govuk-button--start" />
            </form>
        </main>
    </Layout>
);

export default MatchingBase;
