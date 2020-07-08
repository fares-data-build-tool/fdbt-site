import React, { ReactElement } from 'react';
import { NextPage } from 'next';
import { BaseLayout } from '../layout/Layout';

const title = 'Fares Data Build Tool';
const description = 'Fares Data Build Tool is a service that allows you to generate data in NeTEx format';

const Home: NextPage = (): ReactElement => (
    <BaseLayout title={title} description={description}>
        <h1 className="govuk-heading-xl">Fares Data Build Tool</h1>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
                <div>
                    <p className="govuk-body govuk-!-font-weight-bold content-one-quarter">
                        Create & download fares data
                    </p>
                    <p className="govuk-body">
                        For bus operators running commercial bus services in England, and local authorities that need to
                        create or access NeTEx data for the services they operate.
                    </p>
                    <a href="/fareType" className="govuk-link govuk-!-font-size-19" id="faretype-link">
                        Create NeTEx data for your fares
                    </a>
                </div>
                <div className="govuk-!-margin-top-9">
                    <p className="govuk-body govuk-!-font-weight-bold content-one-quarter">Operator settings</p>
                    <p className="govuk-body">
                        For updating the information we use about your services when creating NeTEx data.
                    </p>

                    <a href="/account" className="govuk-link govuk-!-font-size-19" id="account-link">
                        My account settings
                    </a>
                </div>
            </div>
            <div className="govuk-grid-column-one-third">
                <p className="govuk-body govuk-!-font-weight-bold content-one-quarter">Public information</p>
                <a href="/contact" className="govuk-link govuk-!-font-size-19" id="contact-link">
                    Contact Us
                </a>
            </div>
        </div>
    </BaseLayout>
);

export const getServerSideProps = (): {} => {
    return { props: {} };
};

export default Home;
