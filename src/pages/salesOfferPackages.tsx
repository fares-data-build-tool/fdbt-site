import React, { ReactElement } from 'react';
import { BaseLayout } from '../layout/Layout';
import { CustomAppProps, ErrorInfo, NextPageContextWithSession } from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import { getSessionAttribute } from '../utils/sessions';
import { SALES_OFFER_PACKAGES_ATTRIBUTE } from '../constants';
import FormElementWrapper from '../components/FormElementWrapper';

const title = 'Sales Offer Packages - Fares Data Build Tool';
const description = 'Sales Offer Packages page for the Fares Data Build Tool';

export const ticketsPurchasedList = {
    id: 'ticketsPurchasedFrom',
    method: [
        'OnBoard',
        'Online',
        'Online Account',
        'Telephone',
        'Electronic Pass',
        'Mobile Device',
        'Agency',
        'Tour Operator',
    ],
};

export const ticketPaymentMethodsList = {
    id: 'ticketPayments',
    paymentMethod: [
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
    ],
};

export const ticketFormatsList = {
    id: 'ticketFormats',
    ticketFormats: ['Paper Ticket', 'Mobile App', 'Smart Card'],
};

interface SalesOfferPackage {
    selected: string[];
}

export interface SalesOfferPackagesProps {
    ticketsPurchasedFrom: SalesOfferPackage;
    ticketPayments: SalesOfferPackage;
    ticketFormats: SalesOfferPackage;
    errors: ErrorInfo[];
}

export const SalesOfferPackagesInfo = () => (
    <>
        <h1 className="govuk-heading-s">What is a Sales Offer Package?</h1>
        <p className="govuk-body">To create a NeTEx for your fares it needs to contain the following:</p>
        <ol className="govuk-body">
            <li>Where the ticket can be bought</li>
            <li>What payment methods can be used to buy the ticket</li>
            <li>In what format the ticket will be used by passengers</li>
        </ol>
        <p className="govuk-body">
            This combination of information is called a <strong>sales offer package</strong>
        </p>
    </>
);

const SalesOfferPackages = ({
    ticketsPurchasedFrom,
    ticketPayments,
    ticketFormats,
    errors,
    csrfToken,
}: SalesOfferPackagesProps & CustomAppProps): ReactElement => {
    return (
        <BaseLayout title={title} description={description}>
            <CsrfForm action="/api/salesOfferPackages" method="post" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={errors} />
                    <h1 className="govuk-heading-xl">How are the tickets sold - Sales offer package</h1>
                    <span id="service-list-hint" className="govuk-hint">
                        Please select all that apply from the lists below:
                    </span>
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-two-thirds">
                            <FormElementWrapper
                                errors={errors}
                                errorId={ticketsPurchasedList.id}
                                errorClass="govuk-form-group--error"
                            >
                                <div className="govuk-form-group">
                                    <fieldset
                                        className="govuk-fieldset"
                                        aria-describedby="sales-offer-package-ticket-purchased"
                                    >
                                        <p className="govuk-body">Where can tickets be purchased?</p>
                                        {ticketsPurchasedList.method.map((purchaseFrom, index) => {
                                            return (
                                                <div
                                                    className="govuk-checkboxes__item"
                                                    key={`checkbox-item-${purchaseFrom}`}
                                                >
                                                    <input
                                                        className="govuk-checkboxes__input"
                                                        id={`checkbox-${index}-${purchaseFrom}`}
                                                        name="ticketsPurchasedFrom"
                                                        type="checkbox"
                                                        value={purchaseFrom}
                                                        defaultChecked={ticketsPurchasedFrom.selected.includes(
                                                            purchaseFrom,
                                                        )}
                                                    />
                                                    <label
                                                        className="govuk-label govuk-checkboxes__label"
                                                        htmlFor={`checkbox-${index}-${purchaseFrom}`}
                                                    >
                                                        {purchaseFrom}
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </fieldset>
                                </div>
                            </FormElementWrapper>
                            <FormElementWrapper
                                errors={errors}
                                errorId={ticketPaymentMethodsList.id}
                                errorClass="govuk-form-group--error"
                            >
                                <div className="govuk-form-group">
                                    <fieldset
                                        className="govuk-fieldset"
                                        aria-describedby="sales-offer-package-ticket-payment"
                                    >
                                        <p className="govuk-body">How can tickets be paid for?</p>
                                        {ticketPaymentMethodsList.paymentMethod.map((payment, index) => {
                                            return (
                                                <div
                                                    className="govuk-checkboxes__item"
                                                    key={`checkbox-item-${payment}`}
                                                >
                                                    <input
                                                        className="govuk-checkboxes__input"
                                                        id={`checkbox-${index}-${payment}`}
                                                        name="ticketPayments"
                                                        type="checkbox"
                                                        value={payment}
                                                        defaultChecked={ticketPayments.selected.includes(payment)}
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
                                    </fieldset>
                                </div>
                            </FormElementWrapper>
                            <FormElementWrapper
                                errors={errors}
                                errorId={ticketFormatsList.id}
                                errorClass="govuk-form-group--error"
                            >
                                <div className="govuk-form-group">
                                    <fieldset
                                        className="govuk-fieldset"
                                        aria-describedby="sales-offer-package-ticket-format"
                                    >
                                        <p className="govuk-body">What format do the tickets come in?</p>
                                        {ticketFormatsList.ticketFormats.map((ticket, index) => {
                                            return (
                                                <div className="govuk-checkboxes__item" key={`checkbox-item-${ticket}`}>
                                                    <input
                                                        className="govuk-checkboxes__input"
                                                        id={`checkbox-${index}-${ticket}`}
                                                        name="ticketFormats"
                                                        type="checkbox"
                                                        value={ticket}
                                                        defaultChecked={ticketFormats.selected.includes(ticket)}
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
                                    </fieldset>
                                </div>
                            </FormElementWrapper>
                        </div>
                        <div className="govuk-grid-column-one-third">{SalesOfferPackagesInfo()}</div>
                    </div>
                    <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
                </>
            </CsrfForm>
        </BaseLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: SalesOfferPackagesProps } => {
    const salesPackageOffer = getSessionAttribute(ctx.req, SALES_OFFER_PACKAGES_ATTRIBUTE);

    if (!salesPackageOffer) {
        return {
            props: {
                ticketsPurchasedFrom: { selected: [] },
                ticketPayments: { selected: [] },
                ticketFormats: { selected: [] },
                errors: [],
            },
        };
    }

    const { ticketsPurchasedFrom, ticketPayments, ticketFormats } = salesPackageOffer;

    return {
        props: {
            ticketsPurchasedFrom: { selected: ticketsPurchasedFrom || [] },
            ticketPayments: { selected: ticketPayments || [] },
            ticketFormats: { selected: ticketFormats || [] },
            errors: salesPackageOffer.errors,
        },
    };
};

export default SalesOfferPackages;
