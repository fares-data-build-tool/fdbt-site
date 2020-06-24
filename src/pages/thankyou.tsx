import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import { decode } from 'jsonwebtoken';
import TwoThirdsLayout from '../layout/Layout';
import { FEEDBACK_LINK, ID_TOKEN_COOKIE } from '../constants';
import { getUuidFromCookies, deleteAllCookiesOnServerSide } from '../utils';
import { CognitoIdToken } from '../interfaces';

const title = 'Thank You - Fares Data Build Tool';
const description = 'Thank you page for the Fares Data Build Tool';

type ThankYouProps = {
    uuid: string;
    emailAddress: string;
};

const ThankYou = ({ uuid, emailAddress }: ThankYouProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        <div className="govuk-panel govuk-panel--confirmation">
            <h1 className="govuk-panel__title" id="thank-you-page-heading">
                Upload complete
            </h1>
            <div className="govuk-panel__body" id="uuid-ref-number">
                Your reference number
                <br />
                <strong>{uuid}</strong>
            </div>
        </div>
        <h2 className="govuk-heading-m">What happens next</h2>
        <p className="govuk-heading-m">
            Your data will be converted to the NeTEx format and will be emailed to {emailAddress} within the next 5
            minutes for the fares you have just told us about.
        </p>
        <p className="govuk-body">You will be contacted should there be a problem with your upload.</p>
        <p className="govuk-body">
            If you would like to provide feedback on this service, please click{' '}
            <a href={FEEDBACK_LINK} className="govuk-link">
                here
            </a>
        </p>
        <br />
        <a href="/fareType" role="button" draggable="false" className="govuk-button" data-module="govuk-button">
            Add another fare
        </a>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContext): {} => {
    const uuid = getUuidFromCookies(ctx);
    console.info('transaction complete', { uuid });

    const cookies = parseCookies(ctx);
    const idToken = cookies[ID_TOKEN_COOKIE];
    const decodedIdToken = decode(idToken) as CognitoIdToken;
    if (!decodedIdToken.email) {
        throw new Error('Could not extract the user email address and/or noc code from their ID token');
    }

    deleteAllCookiesOnServerSide(ctx);
    return { props: { uuid, emailAddress: decodedIdToken.email } };
};

export default ThankYou;
