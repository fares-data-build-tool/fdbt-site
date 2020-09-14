import React, { ReactElement } from 'react';
import { ErrorInfo } from '../interfaces';
import FormElementWrapper, { FormGroupWrapper } from './FormElementWrapper';
import { MultiProduct } from '../pages/api/multipleProducts';

export interface ProductRowProps {
    numberOfProductsToDisplay: string;
    errors: ErrorInfo[];
    userInput: MultiProduct[];
}

export const continueButton = (): ReactElement => {
    return <input type="submit" value="Continue" id="continue-button" className="govuk-button" />;
};

export const renderTable = (index: number, errors: ErrorInfo[], userInput: MultiProduct[] = []): ReactElement => (
    <fieldset key={index} className="govuk-fieldset">
        <legend className="govuk-fieldset__legend govuk-visually-hidden">
            {`Enter details for product ${index + 1}`}
        </legend>
        <div className="flex-container">
            <div className="govuk-grid-column-one-half">
                <FormGroupWrapper errors={errors} errorId={`multiple-product-name-${index}`}>
                    <>
                        <label className="govuk-label" htmlFor={`multiple-product-name-${index}`}>
                            Product Name
                        </label>
                        <span className="govuk-hint" id={`product-name-hint-${index}`}>
                            Must be between 2 and 50 characters long
                        </span>

                        <FormElementWrapper
                            errors={errors}
                            errorId={`multiple-product-name-${index}`}
                            errorClass="govuk-input--error"
                        >
                            <input
                                className="govuk-input govuk-input--width-30 govuk-product-name-input__inner__input"
                                id={`multiple-product-name-${index}`}
                                name={`multipleProductNameInput${index}`}
                                type="text"
                                aria-describedby={`product-name-hint-${index}`}
                                maxLength={50}
                                defaultValue={userInput.length > 0 ? userInput[index].productName : ''}
                            />
                        </FormElementWrapper>
                    </>
                </FormGroupWrapper>
            </div>
            <div className="govuk-grid-column-one-quarter">
                <FormGroupWrapper errors={errors} errorId={`multiple-product-price-${index}`}>
                    <>
                        <label className="govuk-label" htmlFor={`multiple-product-price-${index}`}>
                            Product Price, in pounds
                        </label>
                        <span className="govuk-hint" id={`product-price-hint-${index}`}>
                            For example, 2.99
                        </span>

                        <div className="govuk-currency-input">
                            <div className="govuk-currency-input__inner">
                                <span className="govuk-currency-input__inner__unit">£</span>
                                <FormElementWrapper
                                    errors={errors}
                                    errorId={`multiple-product-price-${index}`}
                                    errorClass="govuk-input--error"
                                >
                                    <input
                                        className="govuk-input govuk-input--width-10 govuk-currency-input__inner__input"
                                        aria-label="Enter amount in pounds"
                                        name={`multipleProductPriceInput${index}`}
                                        data-non-numeric
                                        type="text"
                                        aria-describedby={`product-price-hint-${index}`}
                                        id={`multiple-product-price-${index}`}
                                        defaultValue={userInput.length > 0 ? userInput[index].productPrice : ''}
                                    />
                                </FormElementWrapper>
                            </div>
                        </div>
                    </>
                </FormGroupWrapper>
            </div>
            <div className="govuk-grid-column-one-quarter">
                <FormGroupWrapper errors={errors} errorId={`multiple-product-duration-${index}`}>
                    <>
                        <label className="govuk-label" htmlFor={`multiple-product-duration-${index}`}>
                            Product Duration, in days
                        </label>
                        <span className="govuk-hint" id={`product-duration-hint-${index}`}>
                            Enter a whole number
                        </span>

                        <FormElementWrapper
                            errors={errors}
                            errorId={`multiple-product-duration-${index}`}
                            errorClass="govuk-input--error"
                        >
                            <input
                                className="govuk-input govuk-input--width-20 govuk-product-name-input__inner__input"
                                id={`multiple-product-duration-${index}`}
                                name={`multipleProductDurationInput${index}`}
                                type="text"
                                aria-describedby={`product-duration-hint-${index}`}
                                maxLength={366}
                                defaultValue={userInput.length > 0 ? userInput[index].productDuration : ''}
                            />
                        </FormElementWrapper>
                    </>
                </FormGroupWrapper>
            </div>
        </div>
    </fieldset>
);

export const renderRows = (
    numberOfRows: string,
    errors: ErrorInfo[],
    userInput: MultiProduct[] = [],
): ReactElement[] => {
    const elements: ReactElement[] = [];
    for (let i = 0; i < Number(numberOfRows); i += 1) {
        elements.push(renderTable(i, errors, userInput));
    }
    return elements;
};

const ProductRow = ({ numberOfProductsToDisplay, errors, userInput = [] }: ProductRowProps): ReactElement => {
    return (
        <div>
            {renderRows(numberOfProductsToDisplay, errors, userInput)}
            {continueButton()}
        </div>
    );
};

export default ProductRow;
