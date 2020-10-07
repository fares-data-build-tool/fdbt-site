import React, { ReactElement } from 'react';
import { parseCookies } from 'nookies';
import TwoThirdsLayout from '../layout/Layout';
import { CustomAppProps, ErrorInfo, NextPageContextWithSession } from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import { getSessionAttribute } from '../utils/sessions';
import { SEARCH_OPERATOR_ATTRIBUTE, OPERATOR_COOKIE } from '../constants';
import { isSearchOperatorAttributeWithErrors } from '../interfaces/typeGuards';
import { getSearchOperators, OperatorNameType } from '../data/auroradb';
import { getAndValidateNoc } from '../utils';
import { removeExcessWhiteSpace } from './api/apiUtils/validator';

const title = 'Search Operators - Fares Data Build Tool';
const description = 'Search Operators page for the Fares Data Build Tool';

type SearchOperatorProps = {
    searchText: string;
    errors: ErrorInfo[];
    searchResults: OperatorNameType[];
    selectedOperators: OperatorNameType[];
};

export const showSelectedOperators = (selectedOperators: OperatorNameType[], errors: ErrorInfo[]): ReactElement => {
    const removeOperatorsId = '';
    const filteredErrors: ErrorInfo[] = [];
    errors.forEach(error => {
        if (error.id === removeOperatorsId) {
            filteredErrors.push(error);
        }
    });
    return (
        <>
            <div className={`govuk-form-group ${filteredErrors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                <fieldset className="govuk-fieldset" aria-describedby="selected-operators">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                        <h1 className="govuk-fieldset__heading" id="selected-operators">
                            Here&apos;s what you have added
                        </h1>
                    </legend>
                    <div className="govuk-inset-text">
                        <FormElementWrapper errors={filteredErrors} errorId={removeOperatorsId} errorClass="">
                            <div className="govuk-checkboxes">
                                {selectedOperators.map((operator, index) => (
                                    <div key={operator.nocCode} className="govuk-checkboxes__item">
                                        <input
                                            className="govuk-checkboxes__input"
                                            id={`checkbox-${index}`}
                                            name="selectedOperators"
                                            value={`${operator.nocCode}#${operator.operatorPublicName}`}
                                            type="checkbox"
                                        />
                                        <label
                                            className="govuk-label govuk-checkboxes__label"
                                            htmlFor={`checkbox-${index}`}
                                        >
                                            {operator.operatorPublicName}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </FormElementWrapper>
                        <input
                            type="submit"
                            value={selectedOperators.length > 1 ? 'Remove Operators' : 'Remove Operator'}
                            id="remove-operators-button"
                            className="govuk-button govuk-button--secondary govuk-!-margin-top-5"
                        />
                    </div>
                </fieldset>
            </div>
        </>
    );
};

export const renderSearchBox = (operatorsAdded: boolean, errors: ErrorInfo[]): ReactElement => {
    const fieldsetProps = {
        legend: {
            className: operatorsAdded ? 'govuk-fieldset__legend--m' : 'govuk-fieldset__legend--l',
        },
        heading: {
            className: 'govuk-fieldset__heading',
            id: 'operator-search',
            content: operatorsAdded
                ? 'Search for more operators that the ticket covers'
                : 'Search for the operators that the ticket covers',
        },
    };
    const searchInputId = 'search-input';
    const searchInputErrors: ErrorInfo[] = [];
    errors.forEach(err => {
        if (err.id === searchInputId) {
            searchInputErrors.push(err);
        }
    });
    return (
        <div className={`govuk-form-group ${searchInputErrors.length > 0 ? 'govuk-form-group--error' : ''}`}>
            <fieldset className="govuk-fieldset" aria-describedby={fieldsetProps.heading.id}>
                <legend className={fieldsetProps.legend.className}>
                    <h1 className={fieldsetProps.heading.className} id={fieldsetProps.heading.id}>
                        {fieldsetProps.heading.content}
                    </h1>
                </legend>
                {searchInputErrors.length > 0 ? (
                    <span id={`${searchInputId}-error`} className="govuk-error-message">
                        <span className="govuk-visually-hidden">Error: </span>
                        {searchInputErrors[0].errorMessage}
                    </span>
                ) : null}
                <label className="govuk-label" htmlFor={searchInputId}>
                    Operator name
                </label>
                <input
                    className={`govuk-input govuk-!-width-three-quarters${
                        searchInputErrors.length > 0 ? ' govuk-input--error' : ''
                    }`}
                    id={searchInputId}
                    name="searchText"
                    type="text"
                />
                <input type="submit" value="Search" id="search-button" className="govuk-button govuk-!-margin-left-5" />
            </fieldset>
        </div>
    );
};

const SearchOperators = ({
    searchText,
    errors,
    searchResults,
    selectedOperators,
    csrfToken,
}: SearchOperatorProps & CustomAppProps): ReactElement => {
    const operatorsAdded = selectedOperators.length > 0;
    const searchResultsErrors: ErrorInfo[] = [];
    return (
        <TwoThirdsLayout title={title} description={description}>
            <CsrfForm action="/api/searchOperators" method="post" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={errors} />
                    {/* 

                    NEED TO SPLIT OUT EACH RENDERING INTO A COMPONENT OR SEPARATE FUNCTION 

                    */}

                    {operatorsAdded ? showSelectedOperators(selectedOperators, errors) : null}
                    {renderSearchBox(operatorsAdded, errors)}

                    {searchResults.length > 0 ? (
                        <div
                            className={`govuk-form-group ${
                                searchResultsErrors.length > 0 ? 'govuk-form-group--error' : ''
                            }`}
                        >
                            <fieldset className="govuk-fieldset" aria-describedby="operator-search-results">
                                <legend className="govuk-fieldset__legend" id="operator-search-results">
                                    <p className="govuk-body-l govuk-!-margin-bottom-0">
                                        Your search for <strong>{searchText}</strong> returned
                                        <strong> {searchResults.length} result(s)</strong>
                                    </p>
                                </legend>
                                <FormElementWrapper errors={searchResultsErrors} errorId="checkbox-0" errorClass="">
                                    <>
                                        <div className="govuk-checkboxes">
                                            <p className="govuk-hint" id="operator-hint-text">
                                                Select the operators results and click add operator(s). This data is
                                                taken from the Traveline National Dataset.
                                            </p>
                                            {searchResults.map((operator, index) => {
                                                const { nocCode, operatorPublicName } = operator;
                                                return (
                                                    <div
                                                        className="govuk-checkboxes__item"
                                                        key={`checkbox-item-${operatorPublicName}`}
                                                    >
                                                        <input
                                                            className="govuk-checkboxes__input"
                                                            id={`checkbox-${index}`}
                                                            name={operatorPublicName}
                                                            type="checkbox"
                                                            value={`${nocCode}#${operatorPublicName}`}
                                                        />
                                                        <label
                                                            className="govuk-label govuk-checkboxes__label"
                                                            htmlFor={`checkbox-${index}`}
                                                        >
                                                            {operatorPublicName}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="govuk-!-margin-top-7">
                                            <input
                                                type="submit"
                                                value="Add Operator(s)"
                                                id="add-operator-button"
                                                className="govuk-button govuk-button--secondary"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="submit"
                                                value="Continue"
                                                id="continue-button"
                                                className="govuk-button"
                                            />
                                        </div>
                                    </>
                                </FormElementWrapper>
                            </fieldset>
                        </div>
                    ) : null}
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: SearchOperatorProps }> => {
    const nocCode = getAndValidateNoc(ctx);

    let searchResults: OperatorNameType[] = [];
    let searchText = '';
    let errors: ErrorInfo[] = [];

    const selectedOperators: OperatorNameType[] = [];
    // const selectedOperators: OperatorNameType[] = [
    //     {
    //         operatorPublicName: "Warrington's Own Buses",
    //         nocCode: 'WBTR',
    //     },
    //     {
    //         operatorPublicName: 'Blackpool Transport',
    //         nocCode: 'BLAC',
    //     },
    //     {
    //         operatorPublicName: 'IW Bus Co',
    //         nocCode: 'IWBusCo',
    //     },
    // ];

    const searchOperatorsAttribute = getSessionAttribute(ctx.req, SEARCH_OPERATOR_ATTRIBUTE);

    if (isSearchOperatorAttributeWithErrors(searchOperatorsAttribute)) {
        errors = searchOperatorsAttribute.errors;
        return {
            props: {
                errors,
                searchText,
                searchResults,
                selectedOperators,
            },
        };
    }

    const { searchOperator } = ctx.query;

    if (!searchOperator) {
        return {
            props: {
                errors,
                searchText,
                searchResults,
                selectedOperators,
            },
        };
    }

    searchText = searchOperator ? removeExcessWhiteSpace(searchOperator.toString()) : '';

    if (searchText.length < 3) {
        errors.push({
            errorMessage: 'Search requires a minimum of three characters',
            id: 'search-input',
        });
        return {
            props: {
                errors,
                searchText,
                searchResults,
                selectedOperators,
            },
        };
    }

    searchResults = await getSearchOperators(searchText, nocCode);
    const cookies = parseCookies(ctx);
    const operatorName: string = JSON.parse(cookies[OPERATOR_COOKIE]).operator.operatorPublicName;
    const filteredResults: OperatorNameType[] = [];
    searchResults.forEach(operator => {
        if (operator.operatorPublicName !== operatorName) {
            filteredResults.push(operator);
        }
    });
    if (filteredResults.length === 0) {
        errors.push({
            errorMessage: `No operators found for: ${searchText} . Try another search term.`,
            id: 'search-input',
        });
    }
    return { props: { errors, searchText, searchResults: filteredResults, selectedOperators } };
};

export default SearchOperators;
