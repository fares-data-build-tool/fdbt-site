/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import Layout from '../layout/Layout';
import { OPERATOR_COOKIE, NUMBER_OF_PRODUCTS_COOKIE, MULTIPLE_PRODUCT_COOKIE } from '../constants';
import ProductRow from '../components/ProductRow';
import { ErrorInfo } from '../types';
import ErrorSummary from '../components/ErrorSummary';

const title = 'Multiple Product - Fares data build tool';
const description = 'Multiple Product page of the Fares data build tool';

export interface MultipleProductProps {
    numberOfProductsToDisplay: number;
    nameOfOperator: string;
    errors: ErrorInfo[];
}

const MultipleProduct = ({
    numberOfProductsToDisplay,
    nameOfOperator,
    errors = [],
}: MultipleProductProps): ReactElement => {
    return (
        <Layout title={title} description={description}>
            <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
                <form action="/api/multipleProduct" method="post">
                    <ErrorSummary errors={errors} />
                    <div className="govuk-form-group">
                        <fieldset className="govuk-fieldset" aria-describedby="period-product-page-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                <h1 className="govuk-fieldset__heading" id="period-product-page-heading">
                                    Enter your product details
                                </h1>
                            </legend>
                            <span className="govuk-hint" id="service-operator-hint">
                                {nameOfOperator} - {numberOfProductsToDisplay} Products
                            </span>
                        </fieldset>
                        <div className="govuk-inset-text">For example, Super Saver ticket - £4.95 - 2</div>
                    </div>
                    <ProductRow numberOfProductsToDisplay={numberOfProductsToDisplay} errors={errors} />
                </form>
            </main>
        </Layout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): {} => {
    const cookies = parseCookies(ctx);
    const operatorCookie = unescape(decodeURI(cookies[OPERATOR_COOKIE]));
    const numberOfProductsCookie = unescape(decodeURI(cookies[NUMBER_OF_PRODUCTS_COOKIE]));

    const numberOfProductsToDisplay: string = JSON.parse(numberOfProductsCookie).numberOfProductsInput;
    const nameOfOperator: string = JSON.parse(operatorCookie).operator;

    if (cookies[MULTIPLE_PRODUCT_COOKIE]) {
        const multipleProductCookie = unescape(decodeURI(cookies[MULTIPLE_PRODUCT_COOKIE]));
        const parsedMultipleProductCookie = JSON.parse(multipleProductCookie);

        console.log(parsedMultipleProductCookie.errors)

        if (parsedMultipleProductCookie.errorMessage) {
            return {
                props: {
                    numberOfProductsToDisplay,
                    nameOfOperator,
                    errors: parsedMultipleProductCookie.errors,
                },
            };
        }
    }

    return {
        props: {
            numberOfProductsToDisplay,
            nameOfOperator,
        },
    };
};

export default MultipleProduct;
