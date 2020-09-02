import React, { ReactElement } from 'react';
import { parseCookies } from 'nookies';
import upperFirst from 'lodash/upperFirst';
import TwoThirdsLayout from '../layout/Layout';
import {
    CSV_ZONE_UPLOAD_COOKIE,
    OPERATOR_COOKIE,
    PASSENGER_TYPE_ATTRIBUTE,
    PRODUCT_DETAILS_ATTRIBUTE,
    SERVICE_LIST_COOKIE,
} from '../constants';
import {
    CustomAppProps,
    ErrorInfo,
    NextPageContextWithSession,
    ProductData,
    ProductInfo,
    ProductInfoWithErrors,
} from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import FormElementWrapper, { FormGroupWrapper } from '../components/FormElementWrapper';
import ErrorSummary from '../components/ErrorSummary';
import { getSessionAttribute } from '../utils/sessions';
import { isPassengerType } from './api/apiUtils/typeChecking';

const title = 'Product Details - Fares Data Build Tool';
const description = 'Product Details entry page of the Fares Data Build Tool';

type ProductDetailsProps = {
    product: ProductInfo | null;
    operator: string;
    passengerType: string;
    hintText?: string;
    errors: ErrorInfo[];
};

export const isProductInfoWithErrors = (
    productDetailsAttribute: ProductInfo | ProductData | ProductInfoWithErrors,
): productDetailsAttribute is ProductInfoWithErrors =>
    (productDetailsAttribute as ProductInfoWithErrors)?.errors !== undefined;

export const isProductInfo = (
    productDetailsAttribute: ProductInfo | ProductData | ProductInfoWithErrors,
): productDetailsAttribute is ProductInfo => (productDetailsAttribute as ProductInfo)?.productName !== undefined;

const ProductDetails = ({
    product,
    operator,
    passengerType,
    hintText,
    csrfToken,
    errors,
}: ProductDetailsProps & CustomAppProps): ReactElement => {
    const productName = product && product.productName;
    const productPrice = product && product.productPrice;

    return (
        <TwoThirdsLayout title={title} description={description}>
            <CsrfForm action="/api/productDetails" method="post" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={errors} />
                    <div className="govuk-form-group">
                        <fieldset className="govuk-fieldset" aria-describedby="product-details-page-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h1 className="govuk-fieldset__heading" id="product-details-page-heading">
                                    Enter your product details
                                </h1>
                            </legend>
                            <span className="govuk-hint" id="service-operator-hint">
                                {operator} - {hintText} - {upperFirst(passengerType)}
                            </span>
                        </fieldset>
                        <FormGroupWrapper errors={errors} errorId="product-name-error">
                            <>
                                <label className="govuk-label" htmlFor="product-details-name">
                                    Product Name
                                </label>
                                <span className="govuk-hint" id="product-name-hint">
                                    Enter the name of your product
                                </span>
                                <FormElementWrapper
                                    errors={errors}
                                    errorId="product-name-error"
                                    errorClass="govuk-input--error"
                                >
                                    <input
                                        className="govuk-input govuk-input--width-30 govuk-product-name-input__inner__input"
                                        id="product-details-name"
                                        name="productDetailsNameInput"
                                        type="text"
                                        maxLength={50}
                                        defaultValue={productName || ''}
                                    />
                                </FormElementWrapper>
                            </>
                        </FormGroupWrapper>
                        <FormGroupWrapper errors={errors} errorId="product-price-error">
                            <>
                                <label className="govuk-label" htmlFor="product-details-price">
                                    Product Price
                                </label>
                                <span className="govuk-hint" id="product-price-hint">
                                    For example, £2.99
                                </span>
                                <div className="govuk-currency-input">
                                    <div className="govuk-currency-input__inner">
                                        <span className="govuk-currency-input__inner__unit">£</span>
                                        <FormElementWrapper
                                            errors={errors}
                                            errorId="product-price-error"
                                            errorClass="govuk-input--error"
                                        >
                                            <input
                                                className="govuk-input govuk-input--width-10 govuk-currency-input__inner__input"
                                                aria-label="Enter amount in pounds"
                                                name="productDetailsPriceInput"
                                                data-non-numeric
                                                type="text"
                                                id="product-details-price"
                                                defaultValue={productPrice || ''}
                                            />
                                        </FormElementWrapper>
                                    </div>
                                </div>
                            </>
                        </FormGroupWrapper>
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
    const zoneCookie = cookies[CSV_ZONE_UPLOAD_COOKIE];
    const serviceListCookie = cookies[SERVICE_LIST_COOKIE];

    const passengerTypeAttribute = getSessionAttribute(ctx.req, PASSENGER_TYPE_ATTRIBUTE);

    let props = {};

    if (!operatorCookie) {
        throw new Error('Failed to retrieve operator cookie info for product details page.');
    }

    if (!isPassengerType(passengerTypeAttribute)) {
        throw new Error('Failed to retrieve passenger type cookie info for product details page.');
    }

    if (!zoneCookie && !serviceListCookie) {
        throw new Error('Failed to retrieve zone or service list cookie info for product details page.');
    }

    const operatorTypeInfo = JSON.parse(operatorCookie);
    const { operator } = operatorTypeInfo;

    if (zoneCookie) {
        const { fareZoneName } = JSON.parse(zoneCookie);
        props = {
            hintText: fareZoneName,
        };
    } else if (serviceListCookie) {
        const { selectedServices } = JSON.parse(serviceListCookie);
        props = {
            hintText: selectedServices.length > 1 ? 'Multiple Services' : selectedServices[0].split('#')[0],
        };
    }

    const productDetailsAttribute = getSessionAttribute(ctx.req, PRODUCT_DETAILS_ATTRIBUTE);

    return {
        props: {
            product: productDetailsAttribute && isProductInfo(productDetailsAttribute) ? productDetailsAttribute : null,
            operator: operator.operatorPublicName,
            passengerType: passengerTypeAttribute.passengerType,
            errors:
                productDetailsAttribute && isProductInfoWithErrors(productDetailsAttribute)
                    ? productDetailsAttribute.errors
                    : [],
            ...props,
        },
    };
};

export default ProductDetails;
