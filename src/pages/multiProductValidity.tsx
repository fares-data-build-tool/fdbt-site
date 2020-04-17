import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';

import Layout from '../layout/Layout';
import { MULTIPLE_PRODUCT_COOKIE } from '../constants';
import { deleteCookieOnServerSide, buildTitle } from '../utils';
import { ErrorInfo } from '../types';
import ErrorSummary from '../components/ErrorSummary';

const title = 'Multiple Product Validity - Fares data build tool';
const description = 'Multiple Product Validity page of the Fares data build tool';

export type Product = {
    productName: string;
    productPrice: string;
    productDuration: string;
    productValidity?: string;
    errorMessage?: string;
};

type MultipleProductValidityProps = {
    multipleProducts: Product[];
    errors: ErrorInfo[];
};

export const renderProductRow = (index: number, product: Product): ReactElement => {
    return (
        <tr className="govuk-table__row" id={`productRow${index}`}>
            <th className="govuk-table__cell">{product.productName}</th>
            <td className="govuk-table__cell">{product.productPrice}</td>
            <td className="govuk-table__cell">{product.productDuration}</td>
            <td className="govuk-table__cell">
                <div className="govuk-radios__item">
                    <input
                        className={`govuk-radios__input ${product.errorMessage ? 'govuk-input--error' : ''} `}
                        id={`twenty-four-hours-row${index}`}
                        name={`validity-row${index}`}
                        type="radio"
                        value={`24hr-row${index}`}
                    />
                </div>
            </td>
            <td className="govuk-table__cell">
                <div className="govuk-radios__item">
                    <input
                        className={`govuk-radios__input ${product.errorMessage ? 'govuk-input--error' : ''} `}
                        id={`calendar-day-row${index}`}
                        name={`validity-row${index}`}
                        type="radio"
                        value={`endOfCalendarDay-row${index}`}
                    />
                </div>
            </td>
        </tr>
    );
};

export const renderProductRows = (multipleProducts: Product[]): ReactElement[] => {
    const elements: ReactElement[] = [];
    for (let i = 0; i < multipleProducts.length; i += 1) {
        elements.push(renderProductRow(i, multipleProducts[i]));
    }
    return elements;
};

const MultiProductValidity = ({ multipleProducts, errors }: MultipleProductValidityProps): ReactElement => (
    <Layout title={buildTitle(errors, title)} description={description}>
        <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
            <form action="/api/multiProductValidity" method="post">
                <ErrorSummary errors={errors} />
                <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                    <fieldset className="govuk-fieldset" aria-describedby="multi-product-validity-selection">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                            <h1 className="govuk-fieldset__heading" id="multiProductValidity-page-heading">
                                Enter your product details
                            </h1>
                        </legend>
                        <table className="govuk-table">
                            <thead className="govuk-table__head">
                                <tr className="govuk-table__row">
                                    <th scope="col" className="govuk-table__header">
                                        Product Name
                                    </th>
                                    <th scope="col" className="govuk-table__header">
                                        Product Price
                                    </th>
                                    <th scope="col" className="govuk-table__header">
                                        Duration
                                    </th>
                                    <th scope="col" className="govuk-table__header">
                                        24hrs
                                    </th>
                                    <th scope="col" className="govuk-table__header">
                                        Calendar
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="govuk-table__body">{renderProductRows(multipleProducts)}</tbody>
                        </table>
                        <input
                            type="submit"
                            value="Continue"
                            id="continue-button"
                            className="govuk-button govuk-button--start"
                        />
                    </fieldset>
                </div>
            </form>
        </main>
    </Layout>
);

export const getServerSideProps = (ctx: NextPageContext): {} => {
    const cookies = parseCookies(ctx);
    deleteCookieOnServerSide(ctx, MULTIPLE_PRODUCT_COOKIE);
    const multipleProductCookie = cookies[MULTIPLE_PRODUCT_COOKIE];

    if (!multipleProductCookie) {
        throw new Error('ERROR! The MULTIPLE_PRODUCT_COOKIE could not be found');
    }

    const multipleProducts: Product[] = JSON.parse(multipleProductCookie);
    const errors: ErrorInfo[] = [];
    multipleProducts.forEach(product => {
        if (product.errorMessage) {
            const error: ErrorInfo = { errorMessage: product.errorMessage, errorHref: '#rowID' };
            errors.push(error);
        }
    });

    return { props: { multipleProducts, errors } };
};

export default MultiProductValidity;
