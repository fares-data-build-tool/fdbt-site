import React, { ReactElement } from 'react';
import { parseCookies } from 'nookies';
import upperFirst from 'lodash/upperFirst';
import { FullColumnLayout } from '../layout/Layout';
import {
    OPERATOR_COOKIE,
    NUMBER_OF_PRODUCTS_ATTRIBUTE,
    MULTIPLE_PRODUCT_COOKIE,
    PASSENGER_TYPE_COOKIE,
} from '../constants';
import ProductRow from '../components/ProductRow';
import { ErrorInfo, CustomAppProps, NextPageContextWithSession } from '../interfaces';
import ErrorSummary from '../components/ErrorSummary';
import { MultiProduct } from './api/multipleProducts';
import CsrfForm from '../components/CsrfForm';
import { getSessionAttribute } from '../utils/sessions';
import { isNumberOfProductsAttribute } from './howManyProducts';

const title = 'Multiple Product - Fares Data Build Tool';
const description = 'Multiple Product entry page of the Fares Data Build Tool';

export interface MultipleProductProps {
    numberOfProductsToDisplay: string;
    operator: string;
    passengerType: string;
    errors?: ErrorInfo[];
    userInput: MultiProduct[];
}

const MultipleProducts = ({
    numberOfProductsToDisplay,
    operator,
    passengerType,
    errors = [],
    userInput = [],
    csrfToken,
}: MultipleProductProps & CustomAppProps): ReactElement => (
    <FullColumnLayout title={title} description={description} errors={errors}>
        <CsrfForm action="/api/multipleProducts" method="post" csrfToken={csrfToken}>
            <>
                <ErrorSummary errors={errors} />
                <div className="govuk-form-group">
                    <fieldset className="govuk-fieldset" aria-describedby="multiple-product-page-heading">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                            <h1 className="govuk-fieldset__heading" id="multiple-product-page-heading">
                                Enter your product details
                            </h1>
                        </legend>
                        <span className="govuk-hint" id="service-operator-hint">
                            {operator} - {numberOfProductsToDisplay} Products - {upperFirst(passengerType)}
                        </span>
                    </fieldset>
                    <div className="govuk-inset-text">For example, Super Saver ticket - £4.95 - 2</div>
                </div>
                <div className="govuk-grid-row">
                    <ProductRow
                        numberOfProductsToDisplay={numberOfProductsToDisplay}
                        errors={errors}
                        userInput={userInput}
                    />
                </div>
            </>
        </CsrfForm>
    </FullColumnLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: MultipleProductProps } => {
    const cookies = parseCookies(ctx);
    const numberOfProductsAttribute = getSessionAttribute(ctx.req, NUMBER_OF_PRODUCTS_ATTRIBUTE);

    if (
        !cookies[OPERATOR_COOKIE] ||
        !isNumberOfProductsAttribute(numberOfProductsAttribute) ||
        !cookies[PASSENGER_TYPE_COOKIE]
    ) {
        throw new Error('Necessary cookies/session objects not found to show multiple products page');
    }

    const passengerTypeInfo = JSON.parse(cookies[PASSENGER_TYPE_COOKIE]);
    const numberOfProductsToDisplay = numberOfProductsAttribute.numberOfProductsInput;
    const { operator } = JSON.parse(cookies[OPERATOR_COOKIE]);

    if (cookies[MULTIPLE_PRODUCT_COOKIE]) {
        const multipleProductCookie = cookies[MULTIPLE_PRODUCT_COOKIE];
        const parsedMultipleProductCookie = JSON.parse(multipleProductCookie);
        const { errors } = parsedMultipleProductCookie;

        if (errors && errors.length > 0) {
            return {
                props: {
                    numberOfProductsToDisplay,
                    operator: operator.operatorPublicName,
                    passengerType: passengerTypeInfo.passengerType,
                    errors: parsedMultipleProductCookie.errors,
                    userInput: parsedMultipleProductCookie.userInput,
                },
            };
        }
    }

    return {
        props: {
            numberOfProductsToDisplay,
            operator: operator.operatorPublicName,
            passengerType: passengerTypeInfo.passengerType,
            userInput: [],
        },
    };
};

export default MultipleProducts;
