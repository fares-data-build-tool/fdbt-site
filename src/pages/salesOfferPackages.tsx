import React, { ReactElement } from 'react';
import { NextPage } from 'next';
import { BaseLayout } from '../layout/Layout';

const title = 'Sales Offer Packages - Fares Data Build Tool';
const description = 'Sales Offer Packages page for the Fares Data Build Tool';

const ticketsSoldFrom = [
    'OnBoard',
    'Online',
    'Online Account',
    'Telephone',
    'Electronic Pass',
    'Mobile Device',
    'Agency',
    'Tour Operator',
];

const paymentMethods = [
    'Cash',
    'Debit/Credit card',
    'Contactless card',
    'Mobile Payment',
    'SMS',
    'Cheque',
    'Direct transfer',
    'Standing Order',
    'Warrant',
    'Gift Voucher',
];

const ticketFormats = ['Paper Ticket', 'Mobile App', 'Smart Card'];

const SalesOfferPackages: NextPage = (): ReactElement => (
    <BaseLayout title={title} description={description}>
        <h1 className="govuk-heading-xl">How are the tickets sold - Sales offer package</h1>
        <p className="govuk-body">Please select all that apply from the lists below:</p>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
                <div className="govuk-!-margin-top-5">
                    <p className="govuk-body">Where can tickets be purchased?</p>
                    {ticketsSoldFrom.map((soldFrom, index) => {
                        return (
                            <div className="govuk-checkboxes__item" key={`checkbox-item-${soldFrom}`}>
                                <input
                                    className="govuk-checkboxes__input"
                                    id={`checkbox-${index}-${soldFrom}`}
                                    name={soldFrom}
                                    type="checkbox"
                                    value={soldFrom}
                                />
                                <label className="govuk-label govuk-checkboxes__label" htmlFor={`checkbox-${soldFrom}`}>
                                    {soldFrom}
                                </label>
                            </div>
                        );
                    })}
                </div>
                <div className="govuk-!-margin-top-9">
                    <p className="govuk-body">How can tickets be paid for?</p>
                    {paymentMethods.map((payment, index) => {
                        return (
                            <div className="govuk-checkboxes__item" key={`checkbox-item-${payment}`}>
                                <input
                                    className="govuk-checkboxes__input"
                                    id={`checkbox-${index}-${payment}`}
                                    name={payment}
                                    type="checkbox"
                                    value={payment}
                                />
                                <label
                                    className="govuk-label govuk-checkboxes__label"
                                    htmlFor={`checkbox-${index}-${payment}`}
                                >
                                    {payment}
                                </label>
                            </div>
                        );
                    })}
                </div>
                <div className="govuk-!-margin-top-9">
                    <p className="govuk-body">What format do the tickets come in?</p>
                    {ticketFormats.map((ticket, index) => {
                        return (
                            <div className="govuk-checkboxes__item" key={`checkbox-item-${ticket}`}>
                                <input
                                    className="govuk-checkboxes__input"
                                    id={`checkbox-${index}-${ticket}`}
                                    name={ticket}
                                    type="checkbox"
                                    value={ticket}
                                />
                                <label
                                    className="govuk-label govuk-checkboxes__label"
                                    htmlFor={`checkbox-${index}-${ticket}`}
                                >
                                    {ticket}
                                </label>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="govuk-grid-column-one-third">
                <p className="govuk-body govuk-!-font-weight-bold content-one-quarter">
                    What is a sales offer package?
                </p>
                <p className="govuk-body">To create a NeTEx for your fares it needs to contain the following:</p>
                <p className="govuk-body">1. Where a ticket can be bought</p>
                <p className="govuk-body">2. What payment methods it can be bought with</p>
                <p className="govuk-body">3. What format the ticket is provided to the passenger in </p>
                <p className="govuk-body">
                    This combination of information is called a <strong>sales offer package</strong>
                </p>
            </div>
        </div>
    </BaseLayout>
);

export const getServerSideProps = (): {} => {
    return { props: {} };
};

export default SalesOfferPackages;
