import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import Layout from '../layout/Layout';
import { FEEDBACK_LINK } from '../constants';

const title = 'Error - Fares data build tool';
const description = 'Error page of the Fares data build tool';

interface ErrorProps {
    error?: boolean;
}

const Error = ({ error }: ErrorProps): ReactElement => (
    <Layout title={title} description={description}>
        <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    {error ? (
                        <div>
                            <h1 className="govuk-heading-xl">Sorry, there is a problem with the service.</h1>
                            <p className="govuk-body">Try again later.</p>
                            <p className="govuk-body">
                                Your answers have not been saved, click continue to start again.
                            </p>
                            <p className="govuk-body">
                                Contact us with the feedback button at the top of this page for assistance.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <h1 className="govuk-heading-xl">Page not found</h1>
                            <p className="govuk-body">If you typed the web address, check it is correct.</p>
                            <p className="govuk-body">
                                If you pasted the web address, check you copied the entire address.
                            </p>
                            <p className="govuk-body">
                                If the web address is correct or you selected a link or button,{' '}
                                <a className="govuk-link" id="feedback_link" href={FEEDBACK_LINK}>
                                    contact
                                </a>{' '}
                                us about your fares data.
                            </p>
                            <p className="govuk-body">Click continue to start again.</p>
                        </div>
                    )}

                    <br />
                    <a
                        href="operator"
                        role="button"
                        draggable="false"
                        className="govuk-button govuk-button--start"
                        data-module="govuk-button"
                    >
                        Continue
                    </a>
                </div>
            </div>
        </main>
    </Layout>
);

export const getServerSideProps = (ctx: NextPageContext): {} => {
    if (ctx.res?.statusCode === 404) {
        return { props: {} };
    }
    return { props: { error: true } };
};

export default Error;
