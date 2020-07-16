import React, { ReactElement } from 'react';
import { BaseLayout } from '../layout/Layout';
import { CustomAppProps, NextPageContextWithSession } from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import { getSessionAttribute } from '../utils/sessions';
import { SOP_INFO_ATTRIBUTE } from '../constants';
import FormElementWrapper from '../components/FormElementWrapper';
import { SalesOfferPackageInfo } from './describeSalesOfferPackage';
import { SalesOfferPackageInfoWithErrors } from './api/salesOfferPackages';

const title = 'Sales Offer Packages - Fares Data Build Tool';
const description = 'Sales Offer Packages page for the Fares Data Build Tool';

export const ticketsPurchasedList = {
    id: 'purchaseLocation',
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
    id: 'paymentMethod',
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
    id: 'ticketFormat',
    ticketFormat: ['Paper Ticket', 'Mobile App', 'Smart Card'],
};

export interface SalesOfferPackagesProps {
    salesOfferPackage: SalesOfferPackageInfo | SalesOfferPackageInfoWithErrors;
}

export const isSalesOfferPackageInfoWithErrors = (
    salesOfferPackage: SalesOfferPackageInfo | SalesOfferPackageInfoWithErrors,
): salesOfferPackage is SalesOfferPackageInfoWithErrors =>
    (salesOfferPackage as SalesOfferPackageInfoWithErrors).errors?.length > 0;

export const SalesOfferPackagesInfo = (): ReactElement => (
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
    salesOfferPackage,
    csrfToken,
}: SalesOfferPackagesProps & CustomAppProps): ReactElement => {
    const errors = isSalesOfferPackageInfoWithErrors(salesOfferPackage) ? salesOfferPackage.errors : [];
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
                                                        name="purchaseLocation"
                                                        type="checkbox"
                                                        value={purchaseFrom}
                                                        defaultChecked={salesOfferPackage.purchaseLocation.includes(
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
                                                        name="paymentMethod"
                                                        type="checkbox"
                                                        value={payment}
                                                        defaultChecked={salesOfferPackage.paymentMethod.includes(
                                                            payment,
                                                        )}
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
                                        {ticketFormatsList.ticketFormat.map((ticket, index) => {
                                            return (
                                                <div className="govuk-checkboxes__item" key={`checkbox-item-${ticket}`}>
                                                    <input
                                                        className="govuk-checkboxes__input"
                                                        id={`checkbox-${index}-${ticket}`}
                                                        name="ticketFormat"
                                                        type="checkbox"
                                                        value={ticket}
                                                        defaultChecked={salesOfferPackage.ticketFormat.includes(ticket)}
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
    const rawSalesOfferPackage = getSessionAttribute(ctx.req, SOP_INFO_ATTRIBUTE);

    const defaultSOP: SalesOfferPackageInfo = {
        purchaseLocation: [],
        paymentMethod: [],
        ticketFormat: [],
    };

    return {
        props: { salesOfferPackage: rawSalesOfferPackage || defaultSOP },
    };
};

export default SalesOfferPackages;
