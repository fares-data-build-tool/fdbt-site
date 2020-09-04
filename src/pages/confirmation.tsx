import React, { ReactElement } from 'react';
import { parseCookies } from 'nookies';
import { CustomAppProps, NextPageContextWithSession } from '../interfaces';
import TwoThirdsLayout from '../layout/Layout';
import CsrfForm from '../components/CsrfForm';
import ConfirmationTable from '../components/ConfirmationTable';

const title = 'Confirmation - Fares Data Build Tool';
const description = 'Confirmation page of the Fares Data Build Tool';

type ConfirmationProps = {};

const Confirmation = ({ csrfToken }: ConfirmationProps & CustomAppProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} errors={[]}>
        <CsrfForm action="/api/confirmation" method="post" csrfToken={csrfToken}>
            <>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-one-thirds">
                        <h1 className="govuk-heading-l">Check your answers before sending your fares information</h1>
                        <ConfirmationTable
                            confirmationElements={[
                                {
                                    header: 'Fare Information',
                                    innerElements: [
                                        { name: 'Faretype', content: 'Single', href: '/fareType' },
                                        { name: 'Passenger Type', content: 'Adult', href: '/passengerType' },
                                        { name: 'Time Restrictions', content: 'No', href: '/timeRestrictions' },
                                    ],
                                },
                                {
                                    header: 'Ticket Information',
                                    innerElements: [
                                        { name: 'Service', content: '19 - Start date 05/04/2020', href: '/service' },
                                        {
                                            name: 'Direction',
                                            content: 'Bibby Drive, Staining TO Central Library, Blackpool',
                                            href: '/singleDirection',
                                        },
                                        { name: 'Fare Information', content: '<prices>', href: '/priceEntry' },
                                        { name: 'Matching', content: '<matching Stuff>', href: '/matching' },
                                    ],
                                },
                                {
                                    header: 'Sales Information',
                                    innerElements: [
                                        {
                                            name: 'Sales offer packages',
                                            content: 'Onboard cash, Onboard Contactless',
                                            href: '/selectSalesOfferPackage',
                                        },
                                    ],
                                },
                            ]}
                        />
                        <h2 className="govuk-heading-m">Now send your fares information</h2>

                        <p className="govuk-body">
                            By submitting this notification you are confirming that, to the best of your knowledge, the
                            details you are providing are correct.
                        </p>
                    </div>
                </div>
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: ConfirmationProps } => {
    parseCookies(ctx);
    return { props: {} };
};

export default Confirmation;
