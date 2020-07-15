import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import { FullColumnLayout } from '../layout/Layout';
import { SALES_OFFER_PACKAGE_COOKIE } from '../constants';
import { getSalesOfferPackagesByNocCode } from '../data/auroradb';
import { SalesOfferPackage, CustomAppProps, ErrorInfo } from '../interfaces';
import { getNocFromIdToken } from '../utils';
import CsrfForm from '../components/CsrfForm';
import { redirectTo } from './api/apiUtils';

const title = 'Select Sales Offer Package - Fares Data Build Tool';
const description = 'Sales Offer Package selection page of the Fares Data Build Tool';
const errorId = 'sales-offer-package-error';

export interface SelectSalesOfferPackageProps {
    salesOfferPackagesList: SalesOfferPackage[];
    error: ErrorInfo[];
}

const SelectSalesOfferPackage = ({
    salesOfferPackagesList,
    csrfToken,
    error,
}: SelectSalesOfferPackageProps & CustomAppProps): ReactElement => (
    <FullColumnLayout title={title} description={description}>
        <CsrfForm action="/api/selectSalesOfferPackage" method="post" csrfToken={csrfToken}>
            <>
                <ErrorSummary errors={error} />
                <div className="govuk-form-group">
                    <fieldset className="govuk-fieldset" aria-describedby="select-sales-offer-package-page-heading">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                            <h1 className="govuk-fieldset__heading" id="select-sales-offer-package-page-heading">
                                How are the tickets sold?
                            </h1>
                        </legend>
                        <span id="radio-error" className="govuk-error-message">
                            <span className={error.length > 0 ? '' : 'govuk-visually-hidden'}>
                                {error[0] ? error[0].errorMessage : ''}
                            </span>
                        </span>
                        <div>
                            <p className="govuk-body">
                                To create NeTEx for your fare it needs to contain the following:
                            </p>
                            <ol className="govuk-list govuk-list--number">
                                <li>Where a ticket can be bought</li>
                                <li>What payment method it can be bought with</li>
                                <li>What format the ticket is provided to the passenger in</li>
                            </ol>
                            <p className="govuk-body">
                                This combination of information is called a <strong>sales offer package</strong>. You
                                can choose from one you have already setup or create a new one for these products.
                            </p>
                            <p className="govuk-body">
                                Choose from your previously used sales offer packages or create a new one:
                            </p>
                            <p className="govuk-body govuk-!-font-weight-bold content-one-quarter">
                                Your sales offer packages
                            </p>
                        </div>
                    </fieldset>
                    <fieldset className="govuk-fieldset" aria-describedby="service-list-hint">
                        <FormElementWrapper errors={error} errorId={errorId} errorClass="govuk-form-group--error">
                            <div className="govuk-checkboxes">
                                {salesOfferPackagesList.map((offer, index) => {
                                    const { name, packageDescription } = offer;

                                    let checkboxTitles = `${name} - ${packageDescription}`;

                                    if (checkboxTitles.length > 110) {
                                        checkboxTitles = `${checkboxTitles.substr(0, checkboxTitles.length - 10)}...`;
                                    }

                                    return (
                                        <div className="govuk-checkboxes__item" key={`checkbox-item-${name}`}>
                                            <input
                                                className="govuk-checkboxes__input"
                                                id={`checkbox-${index}`}
                                                name={`${name}`}
                                                type="checkbox"
                                                value={`${packageDescription}`}
                                            />
                                            <label
                                                className="govuk-label govuk-checkboxes__label"
                                                htmlFor={`checkbox-${index}`}
                                            >
                                                {checkboxTitles}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </FormElementWrapper>
                    </fieldset>
                </div>
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
                <a
                    href="/salesOfferPackage"
                    role="button"
                    draggable="false"
                    className="govuk-button govuk-button--secondary"
                    data-module="govuk-button"
                    id="create-new-button"
                >
                    Create New
                </a>
            </>
        </CsrfForm>
    </FullColumnLayout>
);

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: SelectSalesOfferPackageProps }> => {
    const cookies = parseCookies(ctx);
    const salesOfferPackageCookie = cookies[SALES_OFFER_PACKAGE_COOKIE];
    const nocCode = getNocFromIdToken(ctx);

    if (!nocCode) {
        throw new Error('Necessary nocCode from ID Token cookie not found to show selectSalesOfferPackageProps page');
    }

    const salesOfferPackagesList = await getSalesOfferPackagesByNocCode(nocCode);

    if (salesOfferPackagesList.length === 0) {
        if (ctx.res) {
            redirectTo(ctx.res, '/salesOfferPackage');
        }
    }

    const error: ErrorInfo[] = [];

    if (salesOfferPackageCookie) {
        const cookieContent = JSON.parse(salesOfferPackageCookie);
        if (cookieContent.errorMessage) {
            const errorInfo: ErrorInfo = { errorMessage: cookieContent.errorMessage, id: errorId };
            error.push(errorInfo);
            return {
                props: {
                    salesOfferPackagesList,
                    error,
                },
            };
        }
    }

    return {
        props: {
            salesOfferPackagesList,
            error: [],
        },
    };
};

export default SelectSalesOfferPackage;
