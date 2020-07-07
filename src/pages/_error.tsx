import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { deleteAllCookiesOnServerSide } from '../utils';
import TwoThirdsLayout from '../layout/Layout';
import { FEEDBACK_LINK } from '../constants';

const title = 'Error - Fares Data Build Tool';
const description = 'Error page of the Fares Data Build Tool';

interface ErrorProps {
    statusCode: number;
    ctx: NextPageContext;
}

export const handleClick = () => {
    
}

const Error = ({ statusCode, ctx }: ErrorProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        {statusCode === 404 ? (
            <div>
                <h1 className="govuk-heading-l">Page not found</h1>
                <p className="govuk-body">If you typed the web address, check it is correct.</p>
                <p className="govuk-body">If you pasted the web address, check you copied the entire address.</p>
                <p className="govuk-body">
                    If the web address is correct or you selected a link or button,{' '}
                    <a className="govuk-link" id="feedback-link" href={FEEDBACK_LINK}>
                        contact
                    </a>{' '}
                    us about your fares data.
                </p>
            </div>
        ) : (
            <div>
                <h1 className="govuk-heading-l">Sorry, there is a problem with the service.</h1>
                <p className="govuk-body">Try again later.</p>
                <p className="govuk-body">Your answers have not been saved, use the button below to start again.</p>
                <p className="govuk-body">
                    {' '}
                    <a className="govuk-link" id="feedback-link" href={FEEDBACK_LINK}>
                        Contact
                    </a>{' '}
                    us for assistance.
                </p>
            </div>
        )}

        <br />
        <a
            href="/operator"
            role="button"
            draggable="false"
            className="govuk-button"
            data-module="govuk-button"
            onClick={handleClick}
        >
            Start again
        </a>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContext): {} => {
    return { props: { statusCode: ctx.res?.statusCode, ctx } };
};

export default Error;
