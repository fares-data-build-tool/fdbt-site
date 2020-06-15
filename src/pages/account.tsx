import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import { decode } from 'jsonwebtoken';
import TwoThirdsLayout from '../layout/Layout';
import { ID_TOKEN_COOKIE } from '../constants';
import { CognitoIdToken } from '../interfaces';

const title = 'Account Details - Fares Data Build Tool';
const description = 'Account Details page of the Fares Data Build Tool';

interface AccountDetailsProps {
    emailAddress: string;
    nocCode: string;
}

const AccountDetails = ({ emailAddress, nocCode }: AccountDetailsProps): ReactElement => {
    const passwordDots: ReactElement[] = [];
    for (let i = 0; i < 8; i += 1) {
        passwordDots.push(<span className="dot" />);
    }
    return (
        <TwoThirdsLayout title={title} description={description}>
            <div className="account-details-page">
                <h1 className="govuk-heading-xl">Account Details</h1>

                <div className="content-wrapper">
                    <p className="govuk-body govuk-!-font-weight-bold content-one-third">Email Address</p>
                    <p className="govuk-body email-content">{emailAddress}</p>
                </div>
                <div className="content-wrapper">
                    <p className="govuk-body govuk-!-font-weight-bold content-one-third">Password</p>
                    <span className="password-dots">{passwordDots}</span>
                    <span className="change-password">
                        <a
                            href="/changePassword"
                            role="button"
                            draggable="false"
                            className="govuk-button"
                            data-module="govuk-button"
                            id="change-password-button"
                        >
                            Change
                        </a>
                    </span>
                </div>
                <div className="content-wrapper">
                    <p className="govuk-body govuk-!-font-weight-bold content-one-third">Operator</p>
                    <p className="govuk-body">{nocCode}</p>
                </div>
            </div>

            <a
                href="/"
                role="button"
                draggable="false"
                className="govuk-button govuk-button--start"
                data-module="govuk-button"
                id="return-home-button"
            >
                Home
            </a>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): { props: AccountDetailsProps } => {
    const cookies = parseCookies(ctx);
    console.log({ cookies });
    console.log(cookies[ID_TOKEN_COOKIE]);
    if (!cookies[ID_TOKEN_COOKIE]) {
        console.log('INSIDE ERROR');
        throw new Error('Necessary cookies not found to show account details');
    }
    const idToken = cookies[ID_TOKEN_COOKIE];
    const decodedIdToken = decode(idToken) as CognitoIdToken;
    return { props: { emailAddress: decodedIdToken.email, nocCode: decodedIdToken['custom:noc'] } };
};

export default AccountDetails;
