import React, { ReactElement } from 'react';
import { parseCookies } from 'nookies';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import { FullColumnLayout } from '../layout/Layout';
import { MULTIPLE_PRODUCT_COOKIE, SALES_OFFER_PACKAGES_ATTRIBUTE } from '../constants';
import { getSalesOfferPackagesByNocCode } from '../data/auroradb';
import { SalesOfferPackage, CustomAppProps, ErrorInfo, NextPageContextWithSession, ProductInfo } from '../interfaces';
import { getNocFromIdToken } from '../utils';
import CsrfForm from '../components/CsrfForm';
import { redirectTo } from './api/apiUtils';
import { getSessionAttribute } from '../utils/sessions';

const pageTitle = 'Select Sales Offer Package - Fares Data Build Tool';
const pageDescription = 'Sales Offer Package selection page of the Fares Data Build Tool';
const errorId = 'sales-offer-package-error';

export interface SelectSalesOfferPackageProps {
    productNamesList: string[];
    salesOfferPackagesList: SalesOfferPackage[];
    error: ErrorInfo[];
}

const createSalesOffer = (salesOfferPackagesList: SalesOfferPackage[], productNames: string[]) => {
    const salesOfferPackages = (productName?: string): {} => {
        return salesOfferPackagesList.map((offer, index) => {
            const { name, description } = offer;
            let checkboxTitles = `${name} - ${description}`;

            if (checkboxTitles.length > 110) {
                checkboxTitles = `${checkboxTitles.substr(0, checkboxTitles.length - 10)}...`;
            }

            return (
                <div className="govuk-checkboxes__item" key={`checkbox-item-${name}`}>
                    <input
                        className="govuk-checkboxes__input"
                        id={`checkbox-${index}`}
                        name={productName || name}
                        type="checkbox"
                        value={JSON.stringify(offer)}
                    />
                    <label className="govuk-label govuk-checkboxes__label" htmlFor={`checkbox-${index}`}>
                        {checkboxTitles}
                    </label>
                </div>
            );
        });
    };

    if (productNames && productNames.length > 0) {
        return productNames.map(productName => {
            return (
                <>
                    <p className="govuk-body govuk-!-font-weight-bold content-one-quarter">{productName}</p>
                    {salesOfferPackages(productName)}
                </>
            );
        });
    }

    return { salesOfferPackages };
};

const SelectSalesOfferPackage = ({
    productNamesList,
    salesOfferPackagesList,
    csrfToken,
    error,
}: SelectSalesOfferPackageProps & CustomAppProps): ReactElement => (
    <FullColumnLayout title={pageTitle} description={pageDescription}>
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
                                {createSalesOffer(salesOfferPackagesList, productNamesList)}
                            </div>
                        </FormElementWrapper>
                    </fieldset>
                </div>
                <input
                    type="submit"
                    value="Continue"
                    id="continue-button"
                    className="govuk-button govuk-!-margin-right-8"
                />
                <a
                    href="/salesOfferPackages"
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

export const getServerSideProps = async (
    ctx: NextPageContextWithSession,
): Promise<{ props: SelectSalesOfferPackageProps }> => {
    const nocCode = getNocFromIdToken(ctx);

    if (!nocCode) {
        throw new Error('Necessary nocCode from ID Token cookie not found to show selectSalesOfferPackageProps page');
    }
    const salesOfferPackagesList = await getSalesOfferPackagesByNocCode(nocCode);
    if (salesOfferPackagesList.length === 0) {
        if (ctx.res) {
            redirectTo(ctx.res, '/salesOfferPackages');
        }
    }

    const cookies = parseCookies(ctx);
    const multipleProductCookie = cookies[MULTIPLE_PRODUCT_COOKIE];

    let productNames: string[] = [];

    if (multipleProductCookie) {
        const parsedProductCookie = JSON.parse(multipleProductCookie);
        productNames = parsedProductCookie.map((product: ProductInfo) => product.productName);
    }

    const salesOfferPackageAttribute = getSessionAttribute(ctx.req, SALES_OFFER_PACKAGES_ATTRIBUTE);
    const error: ErrorInfo[] = [];
    if (salesOfferPackageAttribute && salesOfferPackageAttribute.errorMessage) {
        const errorInfo: ErrorInfo = { errorMessage: salesOfferPackageAttribute.errorMessage, id: errorId };
        error.push(errorInfo);
        return {
            props: {
                productNamesList: productNames,
                salesOfferPackagesList,
                error,
            },
        };
    }

    return {
        props: {
            productNamesList: productNames,
            salesOfferPackagesList,
            error: [],
        },
    };
};

export default SelectSalesOfferPackage;
