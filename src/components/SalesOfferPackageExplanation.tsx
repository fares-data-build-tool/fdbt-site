import React, { ReactElement } from 'react';

export const SalesOfferPackageExplanation = (): ReactElement => (
    <>
        <h1 className="govuk-heading-s">What is a Sales Offer Package?</h1>
        <p className="govuk-body">To create a NeTEx for your fares it needs to contain the following:</p>
        <ol className="govuk-body">
            <li>Where the ticket can be bought</li>
            <li>What payment methods can be used to buy the ticket</li>
            <li>In what format the ticket will be used by passengers</li>
        </ol>
        <p className="govuk-body">
            This combination of information is known as a <b>sales offer package</b>.
        </p>
    </>
);

export default SalesOfferPackageExplanation;
