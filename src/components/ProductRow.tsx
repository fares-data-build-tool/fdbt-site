import React, { ReactElement } from 'react';
import { ErrorInfo, MultiProduct } from '../interfaces';
import FormElementWrapper, { FormGroupWrapper, FormErrorBlock } from './FormElementWrapper';
import ExpirySelector from './ExpirySelector';

interface ProductRowProps {
    numberOfProductsToDisplay: number;
    errors: ErrorInfo[];
    userInput: MultiProduct[];
    flatFare: boolean;
    carnet: boolean;
}

export const renderTable = (
    index: number,
    errors: ErrorInfo[],
    userInput: MultiProduct[] = [],
    flatFare: boolean,
    carnet: boolean,
): ReactElement => (
    <fieldset key={index} className="govuk-fieldset">
        <legend className="govuk-fieldset__legend govuk-visually-hidden">
            {`Enter details for product ${index + 1}`}
        </legend>
        <div className="flex-container">
            <div className="govuk-grid-column-one-quarter">
                <FormGroupWrapper errors={errors} errorIds={[`multiple-product-name-${index}`]}>
                    <>
                        {index === 0 ? (
                            <>
                                <label className="govuk-label" htmlFor={`multiple-product-name-${index}`}>
                                    <span className="govuk-visually-hidden">{`Product Name - Product ${index +
                                        1}`}</span>
                                    <span aria-hidden>Product name</span>
                                </label>
                                <span className="govuk-hint" id={`product-name-hint-${index}`}>
                                    50 characters max
                                </span>{' '}
                            </>
                        ) : (
                            ''
                        )}

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
                                defaultValue={userInput[index]?.productName ?? ''}
                            />
                        </FormElementWrapper>
                    </>
                </FormGroupWrapper>
            </div>
            <div className="govuk-grid-column-one-quarter">
                <FormGroupWrapper errors={errors} errorIds={[`multiple-product-price-${index}`]}>
                    <>
                        {index === 0 ? (
                            <>
                                <label className="govuk-label" htmlFor={`multiple-product-price-${index}`}>
                                    <span className="govuk-visually-hidden">{`Product Price, in pounds - Product ${index +
                                        1}`}</span>
                                    <span aria-hidden>Price, in pounds</span>
                                </label>
                                <span className="govuk-hint" id={`product-price-hint-${index}`}>
                                    For example, 2.99
                                </span>
                            </>
                        ) : (
                            ''
                        )}

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
                                        name={`multipleProductPriceInput${index}`}
                                        data-non-numeric
                                        type="text"
                                        aria-describedby={`product-price-hint-${index}`}
                                        id={`multiple-product-price-${index}`}
                                        defaultValue={userInput[index]?.productPrice ?? ''}
                                    />
                                </FormElementWrapper>
                            </div>
                        </div>
                    </>
                </FormGroupWrapper>
            </div>
            {!flatFare ? (
                <div className="govuk-grid-column-one-quarter">
                    <FormGroupWrapper
                        errors={errors}
                        errorIds={['product-details-period-duration-quantity', 'product-details-period-duration-unit']}
                    >
                        <>
                            {index === 0 ? (
                                <>
                                    <label className="govuk-label" htmlFor="product-details-period-duration">
                                        Period duration
                                    </label>
                                    <span className="govuk-hint" id="product-period-duration-hint">
                                        For example, 3 days
                                    </span>
                                </>
                            ) : (
                                ''
                            )}

                            <FormErrorBlock
                                errors={errors}
                                errorIds={[
                                    'product-details-period-duration-quantity',
                                    'product-details-period-duration-unit',
                                ]}
                            />

                            <ExpirySelector
                                defaultDuration=""
                                defaultUnit={undefined}
                                quantityName={`multipleProductDurationInput${index}`}
                                quantityId="product-details-period-duration-quantity"
                                hintId="product-period-duration-hint"
                                unitName={`multipleProductDurationUnitsInput${index}`}
                                unitId="product-details-period-duration-unit"
                                carnet={false}
                                errors={errors}
                            />
                        </>
                    </FormGroupWrapper>
                </div>
            ) : (
                ''
            )}
            {carnet ? (
                <>
                    <div className="govuk-grid-column-one-quarter">
                        <FormGroupWrapper errors={errors} errorIds={['product-details-carnet-quantity']}>
                            <>
                                {index === 0 ? (
                                    <>
                                        <label
                                            className="govuk-label"
                                            htmlFor={`product-details-carnet-quantity-${index}`}
                                        >
                                            <span aria-hidden>Quantity in bundle</span>
                                        </label>
                                        <span className="govuk-hint" id="product-quantity-hint">
                                            Must be 2 or more
                                        </span>
                                    </>
                                ) : (
                                    ''
                                )}

                                <FormElementWrapper
                                    errors={errors}
                                    errorId="product-details-carnet-quantity"
                                    errorClass="govuk-input--error"
                                >
                                    <input
                                        className="govuk-input govuk-input--width-10"
                                        name={`carnetQuantityInput${index}`}
                                        data-non-numeric
                                        type="text"
                                        id={`product-details-carnet-quantity-${0}`}
                                        aria-describedby="product-quantity-hint"
                                        defaultValue=""
                                    />
                                </FormElementWrapper>
                            </>
                        </FormGroupWrapper>
                    </div>
                    <div className="govuk-grid-column-one-quarter">
                        <FormGroupWrapper
                            errors={errors}
                            errorIds={['product-details-carnet-expiry-quantity', 'product-details-carnet-expiry-unit']}
                        >
                            <>
                                {index === 0 ? (
                                    <>
                                        <label className="govuk-label" htmlFor="product-details-carnet-expiry">
                                            Carnet expiry
                                        </label>
                                        <span className="govuk-hint" id="product-carnet-expiry-hint">
                                            e.g. 2 months
                                        </span>
                                    </>
                                ) : (
                                    ''
                                )}

                                <FormErrorBlock
                                    errors={errors}
                                    errorIds={[
                                        'product-details-carnet-expiry-quantity',
                                        'product-details-carnet-expiry-unit',
                                    ]}
                                />

                                <ExpirySelector
                                    defaultDuration=""
                                    defaultUnit={undefined}
                                    quantityName={`carnetExpiryDurationInput${index}`}
                                    quantityId={`product-details-carnet-expiry-quantity-${index}`}
                                    hintId="product-carnet-expiry-hint"
                                    unitName={`carnetExpiryUnitInput${index}`}
                                    unitId={`product-details-carnet-expiry-unit-${index}`}
                                    carnet
                                    errors={errors}
                                />
                            </>
                        </FormGroupWrapper>
                    </div>
                </>
            ) : (
                ''
            )}
        </div>
    </fieldset>
);

export const renderRows = (
    numberOfRows: number,
    errors: ErrorInfo[],
    userInput: MultiProduct[] = [],
    flatFare: boolean,
    carnet: boolean,
): ReactElement[] => {
    const elements: ReactElement[] = [];
    for (let i = 0; i < numberOfRows; i += 1) {
        elements.push(renderTable(i, errors, userInput, flatFare, carnet));
    }
    return elements;
};

const ProductRow = ({
    numberOfProductsToDisplay,
    errors,
    userInput = [],
    flatFare,
    carnet,
}: ProductRowProps): ReactElement => {
    return <div>{renderRows(numberOfProductsToDisplay, errors, userInput, flatFare, carnet)}</div>;
};

export default ProductRow;
