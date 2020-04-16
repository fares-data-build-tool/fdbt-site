/* eslint-disable no-nested-ternary */
import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import Layout from '../layout/Layout';
import { NUMBER_OF_PRODUCTS_COOKIE, CSV_ZONE_UPLOAD_COOKIE } from '../constants';
import { deleteCookieOnServerSide } from '../utils';

const title = 'How Many Products - Fares data build tool';
const description = 'How many products page of the Fares data build tool';

export type InputCheck = {
    error?: string;
    numberOfProductsInput?: string;
};

type HowManyProductProps = {
    previousPage: string;
    inputCheck: InputCheck;
};

const HowManyProducts = ({ previousPage, inputCheck }: HowManyProductProps): ReactElement => (
    <Layout title={title} description={description}>
        <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
            <form action="/api/howManyProducts" method="post">
                <div className="govuk-form-group">
                    <fieldset className="govuk-fieldset" aria-describedby="page-heading">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                            <h1 className="govuk-fieldset__heading" id="page-heading">
                                How many products do you have for{' '}
                                {previousPage === 'csvZoneUpload'
                                    ? 'this zone'
                                    : previousPage === 'singleOperator'
                                    ? 'your selected services'
                                    : 'this zone or selected services'}
                                ?
                            </h1>
                        </legend>
                        <div
                            className={`govuk-form-group${
                                inputCheck?.error ? ' govuk-form-group--error input-error' : ''
                            }`}
                        >
                            <label className="govuk-label" htmlFor="numberOfProducts">
                                Number of fare products (up to a maximum of 10)
                            </label>
                            {inputCheck?.error ? (
                                <span id="numberOfProducts-error" className="govuk-error-message">
                                    <span className="govuk-visually-hidden">Error:</span> {inputCheck.error}
                                </span>
                            ) : null}
                            <input
                                className={`govuk-input govuk-input--width-2 ${
                                    inputCheck?.error ? 'govuk-input--error' : ''
                                }`}
                                id="numberOfProducts"
                                name="numberOfProductsInput"
                                type="text"
                                defaultValue={!inputCheck?.error ? inputCheck?.numberOfProductsInput : ''}
                                aria-describedby={inputCheck?.error ? `numberOfProducts-error` : ''}
                            />
                        </div>
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

export const getPreviousPage = (cookies: { [key: string]: string }): string => {
    let previousPage = 'unknown';
    if (cookies[CSV_ZONE_UPLOAD_COOKIE]) {
        previousPage = 'csvZoneUpload';
    }
    if (!cookies[CSV_ZONE_UPLOAD_COOKIE]) {
        previousPage = 'singleOperator';
    }
    return previousPage;
};

export const getServerSideProps = (ctx: NextPageContext): {} => {
    const cookies = parseCookies(ctx);
    console.log(cookies);
    deleteCookieOnServerSide(ctx, NUMBER_OF_PRODUCTS_COOKIE);

    const previousPage = getPreviousPage(cookies);
    let inputCheck: InputCheck = {};
    if (cookies[NUMBER_OF_PRODUCTS_COOKIE]) {
        const numberOfProductsCookie = cookies[NUMBER_OF_PRODUCTS_COOKIE];
        inputCheck = JSON.parse(numberOfProductsCookie);
    }
    return { props: { previousPage, inputCheck } };
};

export default HowManyProducts;
