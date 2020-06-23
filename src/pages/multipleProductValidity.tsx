import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';

import { FullColumnLayout } from '../layout/Layout';
import {
    MULTIPLE_PRODUCT_COOKIE,
    OPERATOR_COOKIE,
    PASSENGER_TYPE_COOKIE,
    NUMBER_OF_PRODUCTS_COOKIE,
} from '../constants';
import { ErrorInfo, CustomAppProps } from '../interfaces';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import CsrfForm from '../components/CsrfForm';
import _ from 'lodash';

const title = 'Multiple Product Validity - Fares Data Build Tool';
const description = 'Multiple Product Validity selection page of the Fares Data Build Tool';

const errorId = 'multiple-product-validity-error';

export interface Product {
    productName: string;
    productNameId?: string;
    productPrice: string;
    productPriceId?: string;
    productDuration: string;
    productDurationId?: string;
    productValidity?: string;
    productValidityError?: string;
}

interface MultipleProductValidityProps {
    operator: string;
    passengerType: string;
    numberOfProducts: string;
    multipleProducts: Product[];
    errors: ErrorInfo[];
}

const MultipleProductValidity = ({
    operator,
    passengerType,
    numberOfProducts,
    multipleProducts,
    errors,
    csrfToken,
}: MultipleProductValidityProps & CustomAppProps): ReactElement => (
    <FullColumnLayout title={title} description={description} errors={errors}>
        <CsrfForm
            action="/api/multipleProductValidity"
            method="post"
            className="multiple-product-validity-page"
            csrfToken={csrfToken}
        >
            <>
                <ErrorSummary errors={errors} />
                <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                        <h1 className="govuk-fieldset__heading" id="multiple-product-validity-page-heading">
                            When does the product expire?
                        </h1>
                    </legend>
                    <span className="govuk-hint" id="operator-products-hint">
                        {operator} - {numberOfProducts} products - {_.upperFirst(passengerType)}
                    </span>
                    <span className="govuk-hint" id="multiple-product-validity-page-hint">
                        We need to know the time that this product would be valid until.
                    </span>
                    <span className="govuk-hint" id="calendar-validity-type-hint">
                        Calendar day means a ticket purchased at 3pm would be valid until midnight on its day of expiry
                    </span>
                    <span className="govuk-hint" id="24hr-validity-type-hint">
                        24hr means a ticket purchased at 3pm will be valid until 3pm on its day of expiry
                    </span>
                    <span id="multiple-product-validity-radios-error" className="govuk-error-message">
                        <span className={errors.length > 0 ? '' : 'govuk-visually-hidden'}>
                            {errors.length > 0 ? errors[0].errorMessage : ''}
                        </span>
                    </span>
                    <FormElementWrapper errors={errors} errorId={errorId} errorClass="govuk-radios--error">
                        <>
                            <div className="grid-headers-wrapper">
                                <div className="govuk-heading-s grid-column-header-one-fifth">Product Name</div>
                                <div className="govuk-heading-s grid-column-header-one-fifth">Product Price</div>
                                <div className="govuk-heading-s grid-column-header-one-fifth">Product Duration</div>
                                <div className="govuk-heading-s grid-column-header-one-fifth" id="24hr-header">
                                    24hr
                                </div>
                                <div className="govuk-heading-s grid-column-header-one-fifth" id="calendar-header">
                                    Calendar day
                                </div>
                            </div>
                            {multipleProducts.map((product, index) => (
                                <fieldset className="govuk-fieldset">
                                    <div className="grid-content-wrapper">
                                        <label
                                            className="govuk-label grid-column-content-one-fifth"
                                            htmlFor={`product-${index}`}
                                        >
                                            {product.productName}
                                        </label>
                                        <label
                                            className="govuk-label grid-column-content-one-fifth"
                                            htmlFor={`product-${index}`}
                                        >
                                            £{product.productPrice}
                                        </label>
                                        <label
                                            className="govuk-label grid-column-content-one-fifth"
                                            htmlFor={`product-${index}`}
                                        >
                                            {`${product.productDuration} day${
                                                Number(product.productDuration) > 1 ? 's' : ''
                                            }`}
                                        </label>
                                        <div className="govuk-radios govuk-radios--inline validity-select-wrapper">
                                            <div className="govuk-radios__item">
                                                <input
                                                    className="govuk-radios__input"
                                                    id={`twenty-four-hours-row-${index}`}
                                                    name={`validity-row${index}`}
                                                    type="radio"
                                                    value="24hr"
                                                />
                                                <label
                                                    className={`govuk-label govuk-radios__label validity-radio-button-margin ${
                                                        errors.length > 0 ? 'validity-radio-button-error-margin' : ''
                                                    }`}
                                                    htmlFor={`twenty-four-hours-row-${index}`}
                                                >
                                                    <span className="visually-hidden-label">24 hour</span>
                                                </label>
                                            </div>
                                            <div className="govuk-radios__item">
                                                <input
                                                    className="govuk-radios__input"
                                                    id={`calendar-day-row-${index}`}
                                                    name={`validity-row${index}`}
                                                    type="radio"
                                                    value="endOfCalendarDay"
                                                />
                                                <label
                                                    className={`govuk-label govuk-radios__label validity-radio-button-margin ${
                                                        errors.length > 0 ? 'validity-radio-button-error-margin' : ''
                                                    }`}
                                                    htmlFor={`calendar-day-row-${index}`}
                                                >
                                                    <span className="visually-hidden-label">Calendar</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            ))}
                        </>
                    </FormElementWrapper>
                </div>
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </FullColumnLayout>
);

export const getServerSideProps = (ctx: NextPageContext): { props: MultipleProductValidityProps } => {
    const cookies = parseCookies(ctx);
    const operatorCookie = cookies[OPERATOR_COOKIE];
    const passengerTypeCookie = cookies[PASSENGER_TYPE_COOKIE];
    const numberOfProductsCookie = cookies[NUMBER_OF_PRODUCTS_COOKIE];
    const multipleProductCookie = cookies[MULTIPLE_PRODUCT_COOKIE];

    if (!operatorCookie || !numberOfProductsCookie || !multipleProductCookie || !passengerTypeCookie) {
        throw new Error('Necessary cookies not found to display the multiple product validity page');
    }

    const { operator } = JSON.parse(operatorCookie);
    const { passengerType } = JSON.parse(passengerTypeCookie);
    const numberOfProducts: string = JSON.parse(numberOfProductsCookie).numberOfProductsInput;
    const multipleProducts: Product[] = JSON.parse(multipleProductCookie);

    const errors: ErrorInfo[] = [];
    const productWithErrors = multipleProducts.find(el => el.productValidityError);
    if (productWithErrors) {
        const errorHref = 'multiple-product-validity-radios-error';
        const error: ErrorInfo = {
            errorMessage: productWithErrors.productValidityError ?? '',
            id: errorHref,
        };
        errors.push(error);
    }

    return {
        props: { operator: operator.operatorPublicName, passengerType, numberOfProducts, multipleProducts, errors },
    };
};

export default MultipleProductValidity;
