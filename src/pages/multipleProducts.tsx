import React, { ReactElement } from 'react';
import { parseCookies } from 'nookies';
import _ from 'lodash';
import { FullColumnLayout } from '../layout/Layout';
import {
    OPERATOR_COOKIE,
    NUMBER_OF_PRODUCTS_ATTRIBUTE,
    MULTIPLE_PRODUCT_ATTRIBUTE,
    PASSENGER_TYPE_ATTRIBUTE,
} from '../constants';
import ProductRow from '../components/ProductRow';
import { ErrorInfo, CustomAppProps, NextPageContextWithSession } from '../interfaces';
import ErrorSummary from '../components/ErrorSummary';
import { MultiProduct } from './api/multipleProducts';
import CsrfForm from '../components/CsrfForm';
import { getSessionAttribute } from '../utils/sessions';

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

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: MultipleProductProps } => {
    const cookies = parseCookies(ctx);

    if (!cookies[OPERATOR_COOKIE]) {
        throw new Error('Necessary operator cookie not found to show multiple products page');
    }

    const operatorCookie = cookies[OPERATOR_COOKIE];
    const { operator } = JSON.parse(operatorCookie);

    const numberOfProductsInfo = getSessionAttribute(ctx.req, NUMBER_OF_PRODUCTS_ATTRIBUTE);
    const numberOfProductsToDisplay = numberOfProductsInfo.numberOfProductsInput;
    const passengerTypeInfo = getSessionAttribute(ctx.req, PASSENGER_TYPE_ATTRIBUTE);
    const multipleProductInfo = getSessionAttribute(ctx.req, MULTIPLE_PRODUCT_ATTRIBUTE);

    if (multipleProductInfo && multipleProductInfo.errors) {
        console.log(multipleProductInfo.errors);
        return {
            props: {
                numberOfProductsToDisplay,
                operator: operator.operatorPublicName,
                passengerType: passengerTypeInfo.passengerType,
                errors: multipleProductInfo.errors,
                userInput: multipleProductInfo.userInput,
            },
        };
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
