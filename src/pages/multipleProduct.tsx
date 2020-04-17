/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import Layout from '../layout/Layout';
import { OPERATOR_COOKIE, NUMBER_OF_PRODUCTS_COOKIE } from '../constants';
import ProductRow from '../components/ProductRow';
import { ErrorInfo } from '../types';

const title = 'Multiple Product - Fares data build tool';
const description = 'Multiple Product page of the Fares data build tool';

export interface MultipleProductProps {
    numberOfProductsToDisplay: number;
    nameOfOperator: string;
    errors: ErrorInfo[];
}

const MultipleProduct = (
    { numberOfProductsToDisplay, nameOfOperator, errors = []}: MultipleProductProps
): ReactElement => {
    return (
        <Layout title={title} description={description}>
            <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
                <form action="/api/multipleProduct" method="post">
                    <div className="govuk-form-group">
                        <fieldset className="govuk-fieldset" aria-describedby="period-product-page-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                <h1 className="govuk-fieldset__heading" id="period-product-page-heading">
                                    Enter your product details
                                </h1>
                            </legend>
                            <span className="govuk-hint" id="service-operator-hint">
                                {nameOfOperator}
                            </span>
                        </fieldset>
                    </div>
                    <ProductRow numberOfProductsToDisplay={numberOfProductsToDisplay} errors={errors} />
                </form>
            </main>
        </Layout>
    );
};

export const getServerSideProps = (ctx: NextPageContext): {} => {
    const cookies = parseCookies(ctx);
    const operatorCookie = cookies[OPERATOR_COOKIE];
    const numberOfProductsCookie = cookies[NUMBER_OF_PRODUCTS_COOKIE];

    const numberOfProductsToDisplay: string = JSON.parse(numberOfProductsCookie).numberOfProductsInput;
    const nameOfOperator: string = JSON.parse(operatorCookie).operator;

    const errors = [{errorMessage:'Wrong'},{errorMessage: 'Also Wrong'}]
    // const errors: ErrorInfo[] = [];
    
    return {
        props: {
            numberOfProductsToDisplay,
            nameOfOperator,
            errors,
        },
    };
};


export default MultipleProduct;
