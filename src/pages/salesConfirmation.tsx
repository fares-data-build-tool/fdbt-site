import React, { ReactElement } from 'react';
import startCase from 'lodash/startCase';
import { isArray } from 'lodash';
import { SALES_OFFER_PACKAGES_ATTRIBUTE } from '../constants';
import {
    CustomAppProps,
    NextPageContextWithSession,
    SalesOfferPackage,
    ProductWithSalesOfferPackages,
} from '../interfaces';
import TwoThirdsLayout from '../layout/Layout';
import CsrfForm from '../components/CsrfForm';
import ConfirmationTable, { ConfirmationElement } from '../components/ConfirmationTable';
import { getSessionAttribute } from '../utils/sessions';
import { isProductWithSalesOfferPackages } from '../interfaces/typeGuards';

const title = 'Sales Confirmation - Fares Data Build Tool';
const description = 'Sales Confirmation page of the Fares Data Build Tool';

type SalesConfirmationProps = {
    salesOfferPackages: SalesOfferPackage[] | ProductWithSalesOfferPackages[];
    ticketDating: {};
};

export const buildSalesConfirmationElements = (
    salesOfferPackages: SalesOfferPackage[] | ProductWithSalesOfferPackages[],
): ConfirmationElement[] => {
    const confirmationElements: ConfirmationElement[] = [];
    if (isProductWithSalesOfferPackages(salesOfferPackages)) {
        salesOfferPackages.forEach(product => {
            confirmationElements.push({
                name: 'Product',
                content: startCase(product.productName),
                href: 'selectSalesOfferPackages',
            });
            product.salesOfferPackages.forEach(sop => {
                confirmationElements.push({
                    name: `${startCase(product.productName)} - Sales Offer Package`,
                    content: startCase(sop.name),
                    href: 'selectSalesOfferPackages',
                });
            });
        });
    } else {
        salesOfferPackages.forEach(sop => {
            confirmationElements.push({
                name: 'Sales Offer Package',
                content: startCase(sop.name),
                href: 'selectSalesOfferPackages',
            });
        });
    }
    return confirmationElements;
};

const SalesConfirmation = ({
    csrfToken,
    salesOfferPackages,
}: SalesConfirmationProps & CustomAppProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} errors={[]}>
        <CsrfForm action="/api/salesConfirmation" method="post" csrfToken={csrfToken}>
            <>
                <h1 className="govuk-heading-l">Check your answers before sending your sales information</h1>
                <ConfirmationTable
                    header="Sales Information"
                    confirmationElements={buildSalesConfirmationElements(salesOfferPackages)}
                />
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: SalesConfirmationProps } => {
    const salesOfferPackageInfo = getSessionAttribute(ctx.req, SALES_OFFER_PACKAGES_ATTRIBUTE);

    if (!salesOfferPackageInfo || !isArray(salesOfferPackageInfo)) {
        throw new Error('User has reached confirmation page with incorrect sales info.');
    }

    return {
        props: {
            salesOfferPackages: salesOfferPackageInfo,
            ticketDating: {},
        },
    };
};

export default SalesConfirmation;
