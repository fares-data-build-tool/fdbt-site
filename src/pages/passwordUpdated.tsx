import React, { ReactElement } from 'react';
import { NextPage, NextPageContext } from 'next';
import TwoThirdsLayout from '../layout/Layout';
import { deleteCookieOnServerSide } from '../utils';
import { USER_COOKIE } from '../constants';

const title = 'Password Updated - Fares Data Build Tool';
const description = 'Password Updated page of the Fares Data Build Tool';

const ConfirmRegistration: NextPage = (): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        <h1 className="govuk-heading-l">Password Updated</h1>
        <p className="govuk-body-l">Your password has been updated successfully</p>
        <a
            href="/login"
            role="button"
            draggable="false"
            className="govuk-button"
            data-module="govuk-button"
            id="start-now-button"
        >
            Continue
        </a>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContext): {} => {
    deleteCookieOnServerSide(ctx, USER_COOKIE);
    return { props: {} };
};

export default ConfirmRegistration;
