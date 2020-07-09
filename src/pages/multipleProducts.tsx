import React, { ReactElement } from 'react';
import { parseCookies } from 'nookies';
import _ from 'lodash';
import { NextContextWithSession, ErrorInfo, CustomAppProps } from '../interfaces';
import { FullColumnLayout } from '../layout/Layout';
import {
    OPERATOR_ATTRIBUTE,
    NUMBER_OF_PRODUCTS_ATTRIBUTE,
    MULTIPLE_PRODUCT_ATTRIBUTE,
    PASSENGER_TYPE_ATTRIBUTE,
} from '../constants';
import ProductRow from '../components/ProductRow';
import ErrorSummary from '../components/ErrorSummary';
import { MultiProduct } from './api/multipleProducts';
import CsrfForm from '../components/CsrfForm';

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
                            {operator} - {numberOfProductsToDisplay} Products - {_.upperFirst(passengerType)}
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

export const getServerSideProps = (ctx: NextContextWithSession): { props: MultipleProductProps } => {
    const cookies = parseCookies(ctx);

    if (!cookies[OPERATOR_ATTRIBUTE] || !cookies[NUMBER_OF_PRODUCTS_ATTRIBUTE] || !cookies[PASSENGER_TYPE_ATTRIBUTE]) {
        throw new Error('Necessary cookies not found to show multiple products page');
    }

    const operatorCookie = cookies[OPERATOR_ATTRIBUTE];
    const numberOfProductsCookie = cookies[NUMBER_OF_PRODUCTS_ATTRIBUTE];
    const passengerTypeInfo = JSON.parse(cookies[PASSENGER_TYPE_ATTRIBUTE]);

    const numberOfProductsToDisplay = JSON.parse(numberOfProductsCookie).numberOfProductsInput;
    const { operator } = JSON.parse(operatorCookie);

    if (cookies[MULTIPLE_PRODUCT_ATTRIBUTE]) {
        const multipleProductCookie = cookies[MULTIPLE_PRODUCT_ATTRIBUTE];
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
