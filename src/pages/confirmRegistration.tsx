import React, { ReactElement } from 'react';
import { NextPage } from 'next';
import Layout from '../layout/Layout';

const title = 'Registration Successful - Fares Data Build Tool';
const description = 'Confirm Registration page for the Fares Data Build Tool';

const ConfirmRegistration: NextPage = (): ReactElement => (
    <Layout title={title} description={description}>
        <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
            <h1 className="govuk-heading-xl">Your account has been successfully created</h1>
            <p className="govuk-body-l">Click continue to go to the homepage.</p>
            <a
                href="/"
                role="button"
                draggable="false"
                className="govuk-button govuk-button--start"
                data-module="govuk-button"
                id="start-now-button"
            >
                Continue
            </a>
        </main>
    </Layout>
);

export default ConfirmRegistration;
