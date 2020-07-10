import React, { ReactElement } from 'react';
import { parseCookies } from 'nookies';
import _ from 'lodash';
import { getSessionAttribute } from '../utils/sessions';
import TwoThirdsLayout from '../layout/Layout';
import {
    OPERATOR_COOKIE,
    PRODUCT_DETAILS_ATTRIBUTE,
    CSV_ZONE_UPLOAD_ATTRIBUTE,
    SERVICE_LIST_ATTRIBUTE,
    PASSENGER_TYPE_ATTRIBUTE,
} from '../constants';
import { ProductInfo, CustomAppProps, NextPageContextWithSession } from '../interfaces';
import CsrfForm from '../components/CsrfForm';

const title = 'Product Details - Fares Data Build Tool';
const description = 'Product Details entry page of the Fares Data Build Tool';

type ProductDetailsProps = {
    product: ProductInfo;
    operator: string;
    passengerType: string;
    hintText?: string;
};

const ProductDetails = ({
    product,
    operator,
    passengerType,
    hintText,
    csrfToken,
}: ProductDetailsProps & CustomAppProps): ReactElement => {
    const productName = product && product.productName;
    const productPrice = product && product.productPrice;
    const productNameError = product && product.productNameError;
    const productPriceError = product && product.productPriceError;

    return (
        <TwoThirdsLayout title={title} description={description}>
            <CsrfForm action="/api/productDetails" method="post" csrfToken={csrfToken}>
                <>
                    <div className="govuk-form-group">
                        <fieldset className="govuk-fieldset" aria-describedby="product-details-page-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h1 className="govuk-fieldset__heading" id="product-details-page-heading">
                                    Enter your product details
                                </h1>
                            </legend>
                            <span className="govuk-hint" id="service-operator-hint">
                                {operator} - {hintText} - {_.upperFirst(passengerType)}
                            </span>
                        </fieldset>
                        <div className={`govuk-form-group ${productNameError ? 'govuk-form-group--error' : ''}`}>
                            <label className="govuk-label" htmlFor="product-details-name">
                                Product Name
                            </label>
                            <span className="govuk-hint" id="product-name-hint">
                                Enter the name of your product
                            </span>
                            <span id="product-name-error" className="govuk-error-message">
                                <span className={productNameError ? '' : 'govuk-visually-hidden'}>
                                    {productNameError}
                                </span>
                            </span>
                            <input
                                className={`govuk-input govuk-input--width-30 govuk-product-name-input__inner__input ${
                                    productNameError ? 'govuk-input--error' : ''
                                } `}
                                id="product-details-name"
                                name="productDetailsNameInput"
                                type="text"
                                maxLength={50}
                                defaultValue={productName}
                            />
                        </div>
                        <div className={`govuk-form-group ${productPriceError ? 'govuk-form-group--error' : ''}`}>
                            <label className="govuk-label" htmlFor="product-details-price">
                                Product Price
                            </label>
                            <span className="govuk-hint" id="product-price-hint">
                                For example, £2.99
                            </span>
                            <span id="product-price-error" className="govuk-error-message">
                                <span className={productPriceError ? '' : 'govuk-visually-hidden'}>
                                    {productPriceError}
                                </span>
                            </span>
                            <div className="govuk-currency-input">
                                <div className="govuk-currency-input__inner">
                                    <span className="govuk-currency-input__inner__unit">£</span>
                                    <input
                                        className={`govuk-input govuk-input--width-10 govuk-currency-input__inner__input ${
                                            productPriceError ? 'govuk-input--error' : ''
                                        }`}
                                        aria-label="Enter amount in pounds"
                                        name="productDetailsPriceInput"
                                        data-non-numeric
                                        type="text"
                                        id="product-details-price"
                                        defaultValue={productPrice}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: ProductDetailsProps } => {
    const cookies = parseCookies(ctx);
    const operatorCookie = cookies[OPERATOR_COOKIE];

    const productDetails = getSessionAttribute(ctx.req, PRODUCT_DETAILS_ATTRIBUTE);
    const passengerType = getSessionAttribute(ctx.req, PASSENGER_TYPE_ATTRIBUTE);
    const csvZoneName = getSessionAttribute(ctx.req, CSV_ZONE_UPLOAD_ATTRIBUTE);
    const serviceList = getSessionAttribute(ctx.req, SERVICE_LIST_ATTRIBUTE);

    let props = {};

    if (!operatorCookie) {
        throw new Error('Failed to retrieve operator cookie info for product details page.');
    }

    if (!passengerType) {
        throw new Error('Failed to retrieve passenger type info for product details page.');
    }

    if (!csvZoneName || !serviceList) {
        throw new Error('Failed to retrieve zone or service list info for product details page.');
    }

    const operatorTypeInfo = JSON.parse(operatorCookie);
    const { operator } = operatorTypeInfo;

    if (csvZoneName) {
        props = {
            hintText: csvZoneName,
        };
    } else if (serviceList) {
        props = {
            hintText: serviceList.length > 1 ? 'Multiple Services' : serviceList[0].split('#')[0],
        };
    }

    return {
        props: {
            product: !productDetails ? {} : JSON.parse(productDetails),
            operator: operator.operatorPublicName,
            passengerType,
            ...props,
        },
    };
};

export default ProductDetails;
