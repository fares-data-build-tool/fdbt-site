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
import SalesOfferPackageExplanation from '../components/SalesOfferPackageExplanation';

const title = 'Sales Offer Packages - Fares Data Build Tool';
const description = 'Sales Offer Packages page for the Fares Data Build Tool';

export const ticketsPurchasedList = {
    id: 'purchaseLocations',
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
    id: 'paymentMethods',
    paymentMethods: [
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

export interface SalesOfferPackagesProps {
    salesOfferPackage: SalesOfferPackageInfo | SalesOfferPackageInfoWithErrors;
}

export const isSalesOfferPackageInfoWithErrors = (
    salesOfferPackage: SalesOfferPackageInfo | SalesOfferPackageInfoWithErrors,
): salesOfferPackage is SalesOfferPackageInfoWithErrors =>
    (salesOfferPackage as SalesOfferPackageInfoWithErrors).errors?.length > 0;

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
                    <h1 className="govuk-heading-xl">How are the tickets sold - sales offer package</h1>
                    <span id="service-list-hint" className="govuk-hint">
                        Select all that apply from the lists below
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
                                                        name="purchaseLocations"
                                                        type="checkbox"
                                                        value={purchaseFrom}
                                                        defaultChecked={salesOfferPackage.purchaseLocations.includes(
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
                                        {ticketPaymentMethodsList.paymentMethods.map((payment, index) => {
                                            return (
                                                <div
                                                    className="govuk-checkboxes__item"
                                                    key={`checkbox-item-${payment}`}
                                                >
                                                    <input
                                                        className="govuk-checkboxes__input"
                                                        id={`checkbox-${index}-${payment}`}
                                                        name="paymentMethods"
                                                        type="checkbox"
                                                        value={payment}
                                                        defaultChecked={salesOfferPackage.paymentMethods.includes(
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
                                        {ticketFormatsList.ticketFormats.map((ticket, index) => {
                                            return (
                                                <div className="govuk-checkboxes__item" key={`checkbox-item-${ticket}`}>
                                                    <input
                                                        className="govuk-checkboxes__input"
                                                        id={`checkbox-${index}-${ticket}`}
                                                        name="ticketFormats"
                                                        type="checkbox"
                                                        value={ticket}
                                                        defaultChecked={salesOfferPackage.ticketFormats.includes(
                                                            ticket,
                                                        )}
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
                        <div className="govuk-grid-column-one-third">{SalesOfferPackageExplanation()}</div>
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
        purchaseLocations: [],
        paymentMethods: [],
        ticketFormats: [],
    };

    return {
        props: {
            salesOfferPackage:
                rawSalesOfferPackage && isSalesOfferPackageInfoWithErrors(rawSalesOfferPackage)
                    ? rawSalesOfferPackage
                    : defaultSOP,
        },
    };
};

export default SalesOfferPackages;
