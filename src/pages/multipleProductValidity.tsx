import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';

import Layout from '../layout/Layout';
import { MULTIPLE_PRODUCT_COOKIE, OPERATOR_COOKIE, NUMBER_OF_PRODUCTS_COOKIE } from '../constants';
import { buildTitle } from '../utils';
import { ErrorInfo } from '../types';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';

const title = 'Multiple Product Validity - Fares data build tool';
const description = 'Multiple Product Validity page of the Fares data build tool';

const errorId = 'multiple-product-validity-error';

export interface Product {
    productName: string;
    productPrice: string;
    productDuration: string;
    productValidity?: {
        validity: string;
        error: string;
    };
}

interface MultipleProductValidityProps {
    operator: string;
    numberOfProducts: string;
    multipleProducts: Product[];
    errors: ErrorInfo[];
}

export const renderProductRow = (index: number, product: Product): ReactElement => {
    const error = product.productValidity ? product.productValidity.error : '';
    return (
        <tr className="govuk-table__row" id={`productRow${index}`}>
            <th className="govuk-table__cell">{product.productName}</th>
            <td className="govuk-table__cell">£{product.productPrice}</td>
            <td className="govuk-table__cell">{`${product.productDuration} day${
                Number(product.productDuration) > 1 ? 's' : ''
            }`}</td>
            <td className="govuk-table__cell govuk-radios">
                <div className="govuk-radios__item">
                    <input
                        className={`govuk-radios__input${error !== '' ? ' govuk-input--error' : ''} `}
                        id={`twenty-four-hours-row${index}`}
                        name={`validity-row${index}`}
                        type="radio"
                        value="24hr"
                    />
                    <label
                        className="govuk-label govuk-radios__label"
                        htmlFor={`twenty-four-hours-row${index}`}
                    ></label>
                </div>
            </td>
            <td className="govuk-table__cell">
                <div className="govuk-radios__item">
                    <input
                        className={`govuk-radios__input${error !== '' ? ' govuk-input--error' : ''} `}
                        id={`calendar-day-row${index}`}
                        name={`validity-row${index}`}
                        type="radio"
                        value="endOfCalendarDay"
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor={`calendar-day-row${index}`}></label>
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

const MultiProductValidity = ({
    operator,
    numberOfProducts,
    multipleProducts,
    errors,
}: MultipleProductValidityProps): ReactElement => (
    <Layout title={buildTitle(errors, title)} description={description}>
        <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
            <form action="/api/multipleProductValidity" method="post">
                <ErrorSummary errors={errors} />
                <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                    <fieldset className="govuk-fieldset" aria-describedby="multi-product-validity-selection">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                            <h1 className="govuk-fieldset__heading" id="multiProductValidity-page-heading">
                                Enter your product details
                            </h1>
                        </legend>
                        <span className="govuk-hint" id="service-operator-hint">
                            {operator} - {numberOfProducts} products
                        </span>
                        <FormElementWrapper errors={errors} errorId={errorId} errorClass="govuk-radios--error">
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
                        </FormElementWrapper>
                    </fieldset>
                </div>
                <input
                    type="submit"
                    value="Continue"
                    id="continue-button"
                    className="govuk-button govuk-button--start"
                />
            </form>
        </main>
    </Layout>
);

export const getServerSideProps = (ctx: NextPageContext): {} => {
    const cookies = parseCookies(ctx);
    // deleteCookieOnServerSide(ctx, MULTIPLE_PRODUCT_COOKIE);
    const operatorCookie = cookies[OPERATOR_COOKIE];
    const numberOfProductsCookie = cookies[NUMBER_OF_PRODUCTS_COOKIE];
    const multipleProductCookie = cookies[MULTIPLE_PRODUCT_COOKIE];
    // MULTIPLE_PRODUCT_COOKIE DEV VALUE = [{"productName": "dannys", "productPrice": "300", "productDuration": "7"}, {"productName": "robs", "productPrice": "200", "productDuration": "2"}, {"productName": "laurences", "productPrice": "800", "productDuration": "14"}, {"productName": "giles", "productPrice": "150", "productDuration": "1"}, {"productName": "tejs", "productPrice": "650", "productDuration": "9"}]

    if (!operatorCookie || !numberOfProductsCookie || !multipleProductCookie) {
        throw new Error(
            'Necessary cookies not found. The OPERATOR_COOKIE, NUMBER_OF_PRODUCTS_COOKIE and/or MULTIPLE_PRODUCT_COOKIE could not be retrieved',
        );
    }

    const { operator } = JSON.parse(operatorCookie);
    const numberOfProducts: string = JSON.parse(numberOfProductsCookie).numberOfProductsInput;
    const multipleProducts: Product[] = JSON.parse(multipleProductCookie);

    const errors: ErrorInfo[] = [];
    if (multipleProducts.some(el => el.productValidity && el.productValidity.error !== '')) {
        for (let i = 0; i < multipleProducts.length; i += 1) {
            const product = multipleProducts[i];
            if (product.productValidity) {
                const errorHref =
                    product.productValidity.validity === '24hr' ? `twenty-four-hours-row${i}` : `calendar-day-row${i}`;
                const error: ErrorInfo = { errorMessage: product.productValidity.error, id: errorHref };
                errors.push(error);
            }
        }
    }

    return { props: { operator, numberOfProducts, multipleProducts, errors } };
};

export default MultiProductValidity;
