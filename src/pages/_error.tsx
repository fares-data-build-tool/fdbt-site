import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import Layout from '../layout/Layout';

const title = 'Error - Fares Data Build Tool';
const description = 'Error page of the Fares Data Build Tool';

interface ErrorProps {
    statusCode: number;
}

const Error = ({ statusCode }: ErrorProps): ReactElement => (
    <Layout title={title} description={description}>
        <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
            <div className="govuk-grid-row">
                {!statusCode || statusCode !== 404 ? (
                    <div>
                        <h1 className="govuk-heading-xl">Sorry, there is a problem with the service.</h1>
                        <p className="govuk-body">Try again later.</p>
                        <p className="govuk-body">Your answers have not been saved, click continue to start again.</p>
                        <p className="govuk-body">
                            Contact us with the feedback button at the top of this page for assistance.
                        </p>
                    </div>
                ) : (
                    <div>
                        <h1 className="govuk-heading-xl">Page not found</h1>
                        <p className="govuk-body">If you entered a web address, please check it was correct.</p>
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
        </main>
    </Layout>
);

export const getServerSideProps = (ctx: NextPageContext): {} => {
    return { props: { statusCode: ctx?.res?.statusCode } };
};

export default Error;
