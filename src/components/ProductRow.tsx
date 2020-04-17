import React, { ReactElement } from 'react';
import { ErrorInfo } from '../types';

export interface ProductRowProps {
    numberOfProductsToDisplay: number;
    errors: ErrorInfo[];
}

export const continueButton = (): ReactElement => {
    return <input type="submit" value="Continue" id="continue-button" className="govuk-button govuk-button--start" />;
};

export const renderTable = (index: number): ReactElement => {
    if (index === 0) {
        return (
            <div>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-one-half">
                        <div className="govuk-form-group">
                            <label className="govuk-label" htmlFor={`periodProductName${index}`}>
                                Product Name
                            </label>
                            <span className="govuk-hint" id={`product-name-hint${index}`}>
                                Enter the name of your product
                            </span>
                            <input
                                className="govuk-input govuk-input--width-30 govuk-product-name-input__inner__input"
                                id={`periodProductName${index}`}
                                name={`periodProductNameInput${index}`}
                                type="text"
                                maxLength={50}
                                defaultValue=""
                            />
                        </div>
                    </div>
                    <div className="govuk-grid-column-one-quarter">
                        <div className="govuk-form-group">
                            <label className="govuk-label" htmlFor={`periodProductPrice${index}`}>
                                Product Price
                            </label>
                            <span className="govuk-hint" id={`product-price-hint${index}`}>
                                For example, £2.99
                            </span>
                            <div className="govuk-currency-input">
                                <div className="govuk-currency-input__inner">
                                    <span className="govuk-currency-input__inner__unit">£</span>
                                    <input
                                        className="govuk-input govuk-input--width-10 govuk-currency-input__inner__input"
                                        aria-label="Enter amount in pounds"
                                        name={`periodProductPriceInput${index}`}
                                        data-non-numeric
                                        type="text"
                                        id={`periodProductPrice${index}`}
                                        defaultValue=""
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="govuk-grid-column-one-quarter">
                        <div className="govuk-form-group">
                            <label className="govuk-label" htmlFor={`periodProductDuration${index}`}>
                                Duration
                            </label>
                            <span className="govuk-hint" id={`product-duration-hint${index}`}>
                                Enter a number of days
                            </span>
                            <input
                                className="govuk-input govuk-input--width-20 govuk-product-name-input__inner__input"
                                id={`periodProductDuration${index}`}
                                name={`periodProductDurationInput${index}`}
                                type="text"
                                maxLength={366}
                                defaultValue=""
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor={`periodProductName${index}`}>
                            Product Name
                        </label>
                        <input
                            className="govuk-input govuk-input--width-30 govuk-product-name-input__inner__input"
                            id={`periodProductName${index}`}
                            name={`periodProductNameInput${index}`}
                            type="text"
                            maxLength={50}
                            defaultValue=""
                        />
                    </div>
                </div>
                <div className="govuk-grid-column-one-quarter">
                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor={`periodProductPrice${index}`}>
                            Product Price
                        </label>
                        <div className="govuk-currency-input">
                            <div className="govuk-currency-input__inner">
                                <span className="govuk-currency-input__inner__unit">£</span>
                                <input
                                    className="govuk-input govuk-input--width-10 govuk-currency-input__inner__input"
                                    aria-label="Enter amount in pounds"
                                    name={`periodProductPriceInput${index}`}
                                    data-non-numeric
                                    type="text"
                                    id={`periodProductPrice${index}`}
                                    defaultValue=""
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="govuk-grid-column-one-quarter">
                    <div className="govuk-form-group">
                        <label className="govuk-label" htmlFor={`periodProductDuration${index}`}>
                            Duration
                        </label>
                        <input
                            className="govuk-input govuk-input--width-20 govuk-product-name-input__inner__input"
                            id={`periodProductDuration${index}`}
                            name={`periodProductDurationInput${index}`}
                            type="text"
                            maxLength={366}
                            defaultValue=""
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const renderRows = (numberOfRows: number): ReactElement[] => {
    const elements: ReactElement[] = [];
    for (let i = 0; i < numberOfRows; i += 1) {
        elements.push(renderTable(i));
    }
    return elements;
};

const ProductRow = ({ numberOfProductsToDisplay }: ProductRowProps): ReactElement => {
    return (
        <div>
            {renderRows(numberOfProductsToDisplay)}
            {continueButton()}
        </div>
    );
};

export default ProductRow;
