import React, { ReactElement } from 'react';
import Layout from '../layout/Layout';
import { FEEDBACK_LINK } from '../constants';

const title = 'Error - Fares data build tool';
const description = 'Error page of the Fares data build tool';

const Error = (): ReactElement => (
    <Layout title={title} description={description}>
        <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <div>
                        <h1 className="govuk-heading-xl">Sorry, there is a problem with the service.</h1>
                        <p className="govuk-body">Try again later.</p>
                        <p className="govuk-body">
                            Your answers have not been saved, use the button below to start again.
                        </p>
                        <p className="govuk-body">
                            {' '}
                            <a className="govuk-link" id="feedback_link" href={FEEDBACK_LINK}>
                                Contact
                            </a>{' '}
                            us for assistance.
                        </p>
                    </div>
                </div>
                <br />
                <a href="operator" role="button" draggable="false" className="govuk-button" data-module="govuk-button">
                    Start again
                </a>
            </div>
        </main>
    </Layout>
);

export const getServerSideProps = (): {} => {
    return { props: {} };
};

export default Error;
