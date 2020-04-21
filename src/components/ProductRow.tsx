import React, { ReactElement } from 'react';
import { ErrorInfo } from '../types';
import FormElementWrapper from './FormElementWrapper';

export interface ProductRowProps {
    numberOfProductsToDisplay: number;
    errors: ErrorInfo[];
}

export const continueButton = (): ReactElement => {
    return <input type="submit" value="Continue" id="continue-button" className="govuk-button govuk-button--start" />;
};

export const renderTable = (index: number, errors: ErrorInfo[]): ReactElement => (
    <div>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
                <FormElementWrapper errors={errors} errorId={`multipleProductName${index}`} errorClass="">
                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor={`multipleProductName${index}`}>
                            Product Name
                        </label>
                        {index === 0 ? (
                            <span className="govuk-hint" id={`product-name-hint${index}`}>
                                Enter the name of your product
                            </span>
                        ) : (
                            ''
                        )}
                        <input
                            className="govuk-input govuk-input--width-30 govuk-product-name-input__inner__input"
                            id={`multipleProductName${index}`}
                            name={`multipleProductNameInput${index}`}
                            type="text"
                            maxLength={50}
                            defaultValue=""
                        />
                    </div>
                </FormElementWrapper>
            </div>
            <div className="govuk-grid-column-one-quarter">
                <FormElementWrapper errors={errors} errorId={`multipleProductPrice${index}`} errorClass="">
                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor={`multipleProductPrice${index}`}>
                            Product Price
                        </label>
                        {index === 0 ? (
                            <span className="govuk-hint" id={`product-price-hint${index}`}>
                                For example, £2.99
                            </span>
                        ) : (
                            ''
                        )}
                        <div className="govuk-currency-input">
                            <div className="govuk-currency-input__inner">
                                <span className="govuk-currency-input__inner__unit">£</span>
                                <input
                                    className="govuk-input govuk-input--width-10 govuk-currency-input__inner__input"
                                    aria-label="Enter amount in pounds"
                                    name={`multipleProductPriceInput${index}`}
                                    data-non-numeric
                                    type="text"
                                    id={`multipleProductPrice${index}`}
                                    defaultValue=""
                                />
                            </div>
                        </div>
                    </div>
                </FormElementWrapper>
            </div>
            <div className="govuk-grid-column-one-quarter">
                <FormElementWrapper errors={errors} errorId={`multipleProductDuration${index}`} errorClass="">
                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor={`multipleProductDuration${index}`}>
                            Duration
                        </label>
                        {index === 0 ? (
                            <span className="govuk-hint" id={`product-duration-hint${index}`}>
                                Enter a number of days
                            </span>
                        ) : (
                            ''
                        )}
                        <input
                            className="govuk-input govuk-input--width-20 govuk-product-name-input__inner__input"
                            id={`multipleProductDuration${index}`}
                            name={`multipleProductDurationInput${index}`}
                            type="text"
                            maxLength={366}
                            defaultValue=""
                        />
                    </div>
                </FormElementWrapper>
            </div>
        </div>
    </div>
);

export const renderRows = (numberOfRows: number, errors: ErrorInfo[]): ReactElement[] => {
    const elements: ReactElement[] = [];
    for (let i = 0; i < numberOfRows; i += 1) {
        elements.push(renderTable(i, errors));
    }
    return elements;
};

const ProductRow = ({ numberOfProductsToDisplay, errors }: ProductRowProps): ReactElement => {
    return (
        <div>
            {renderRows(numberOfProductsToDisplay, errors)}
            {continueButton()}
        </div>
    );
};

export default ProductRow;
