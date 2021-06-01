import React, { ReactElement, useState } from 'react';
import { FullColumnLayout } from '../layout/Layout';
import { MULTIPLE_PRODUCT_ATTRIBUTE } from '../constants/attributes';
import ProductRow from '../components/ProductRow';
import { ErrorInfo, NextPageContextWithSession, MultiProduct } from '../interfaces';
import ErrorSummary from '../components/ErrorSummary';
import CsrfForm from '../components/CsrfForm';
import { isWithErrors } from '../interfaces/typeGuards';
import { getSessionAttribute } from '../utils/sessions';
import { getCsrfToken } from '../utils';

const title = 'Multiple Product - Create Fares Data Service';
const description = 'Multiple Product entry page of the Create Fares Data Service';

interface MultipleProductProps {
    errors?: ErrorInfo[];
    userInput: MultiProduct[];
    csrfToken: string;
}

const MultipleProducts = ({ errors = [], userInput = [], csrfToken }: MultipleProductProps): ReactElement => {
    const [numberOfProducts, setNumberOfProducts] = useState(1);
    return (
        <FullColumnLayout title={title} description={description} errors={errors}>
            <CsrfForm action="/api/multipleProducts" method="post" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={errors} />
                    <h1 className="govuk-heading-l" id="multiple-product-page-heading">
                        Enter your product details
                    </h1>
                    <div className="govuk-inset-text">For example, Super Saver ticket - 4.95 - 2 - Days</div>
                    <div className="govuk-grid-row">
                        <ProductRow
                            numberOfProductsToDisplay={numberOfProducts}
                            errors={errors}
                            userInput={userInput}
                        />
                        <div className="flex-container">
                            <button
                                id="add-another-button"
                                type="button"
                                className="govuk-button govuk-button--secondary govuk-!-margin-left-3 govuk-!-margin-bottom-3 time-restrictions-button-placement"
                                onClick={(): void => setNumberOfProducts(numberOfProducts + 1)}
                            >
                                Add another product
                            </button>

                            {numberOfProducts > 1 ? (
                                <button
                                    type="button"
                                    className="govuk-button govuk-button--secondary govuk-!-margin-left-3 govuk-!-margin-bottom-3"
                                    onClick={(): void => setNumberOfProducts(numberOfProducts - 1)}
                                >
                                    Remove last product
                                </button>
                            ) : (
                                ''
                            )}
                        </div>

                        <input
                            type="submit"
                            value="Continue"
                            id="continue-button"
                            className="govuk-button govuk-!-margin-left-3"
                        />
                    </div>
                </>
            </CsrfForm>
        </FullColumnLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: MultipleProductProps } => {
    const csrfToken = getCsrfToken(ctx);

    const multiProductAttribute = getSessionAttribute(ctx.req, MULTIPLE_PRODUCT_ATTRIBUTE);

    return {
        props: {
            errors: isWithErrors(multiProductAttribute) ? multiProductAttribute.errors : [],
            userInput: multiProductAttribute ? multiProductAttribute.products : [],
            csrfToken,
        },
    };
};

export default MultipleProducts;
