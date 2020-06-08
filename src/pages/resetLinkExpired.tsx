import React, { ReactElement } from 'react';
import { NextPage } from 'next';
import TwoThirdsLayout from '../layout/Layout';

const title = 'Reset Password Link Expired - Fares Data Build Tool';
const description = 'Reset Password Link Expired page for the Fares Data Build Tool';

const ResetCodeExpiry: NextPage = (): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        <h1 className="govuk-heading-l">Reset Password Link Expired</h1>
        <p className="govuk-body-l">Your password link has expired.</p>
        <a
            href="/forgottenPassword"
            role="button"
            draggable="false"
            className="govuk-button"
            data-module="govuk-button"
            id="start-now-button"
        >
            Forgotten Password
        </a>
    </TwoThirdsLayout>
);

export default ResetCodeExpiry;
