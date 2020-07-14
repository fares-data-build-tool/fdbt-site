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
    const operatorCookie = cookies[OPERATOR_COOKIE];
    const { numberOfProductsInput } = getSessionAttribute(ctx.req, NUMBER_OF_PRODUCTS_ATTRIBUTE);
    const { passengerType } = getSessionAttribute(ctx.req, PASSENGER_TYPE_ATTRIBUTE);

    if (!operatorCookie || !numberOfProductsInput || !passengerType) {
        throw new Error(
            'Could not retrieve the necessary operator, number of products and/or passenger type info for the multiple products API',
        );
    }

    const { operator } = JSON.parse(operatorCookie);
    const { userInput, errors } = getSessionAttribute(ctx.req, MULTIPLE_PRODUCT_ATTRIBUTE);

    if (userInput) {
        if (errors && errors.length > 0) {
            return {
                props: {
                    numberOfProductsToDisplay: numberOfProductsInput,
                    operator: operator.operatorPublicName,
                    passengerType,
                    errors,
                    userInput,
                },
            };
        }
    }

    return {
        props: {
            numberOfProductsToDisplay: numberOfProducts,
            operator: operator.operatorPublicName,
            passengerType,
            userInput: [],
        },
    };
};

export default MultipleProducts;
