import React, { ReactElement } from 'react';
import { NextPage } from 'next';
import { NextContextWithSession } from '../interfaces';
import TwoThirdsLayout from '../layout/Layout';
import { deleteCookieOnServerSide } from '../utils';
import { USER_COOKIE } from '../constants';

const title = 'Registration Successful - Fares Data Build Tool';
const description = 'Confirm Registration page for the Fares Data Build Tool';

const ConfirmRegistration: NextPage = (): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        <h1 className="govuk-heading-l">Your account has been successfully created</h1>
        <p className="govuk-body-l">Click continue to go to the homepage.</p>
        <a
            href="/"
            role="button"
            draggable="false"
            className="govuk-button"
            data-module="govuk-button"
            id="continue-button"
        >
            Continue
        </a>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextContextWithSession): {} => {
    deleteCookieOnServerSide(ctx, USER_COOKIE);
    return { props: {} };
};

export default ConfirmRegistration;
