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

export type SearchOperatorProps = {
    searchText: string;
    errors: ErrorInfo[];
    searchResults: OperatorNameType[];
    selectedOperators: OperatorNameType[];
};

export const showSelectedOperators = (selectedOperators: OperatorNameType[], errors: ErrorInfo[]): ReactElement => {
    const operatorRemovalErrorId = 'checkbox-0';
    const operatorRemovalErrors: ErrorInfo[] = [];
    errors.forEach(err => {
        if (err.id === operatorRemovalErrorId) {
            operatorRemovalErrors.push(err);
        }
    });
    return (
        <div className={`govuk-form-group ${operatorRemovalErrors.length > 0 ? 'govuk-form-group--error' : ''}`}>
            <fieldset className="govuk-fieldset" aria-describedby="selected-operators">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading" id="selected-operators">
                        Here&apos;s what you have added
                    </h1>
                </legend>
                <div className="govuk-inset-text">
                    <FormElementWrapper errors={operatorRemovalErrors} errorId={operatorRemovalErrorId} errorClass="">
                        <div className="govuk-checkboxes">
                            {selectedOperators.map((operator, index) => (
                                <div key={operator.nocCode} className="govuk-checkboxes__item">
                                    <input
                                        className="govuk-checkboxes__input"
                                        id={`checkbox-${index}`}
                                        name="removedOperators"
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

export const showSearchResults = (
    searchText: string,
    searchResults: OperatorNameType[],
    errors: ErrorInfo[],
): ReactElement => {
    const operatorSelectionErrorId = 'checkbox-0';
    const operatorSelectionErrors: ErrorInfo[] = [];
    errors.forEach(err => {
        if (err.id === operatorSelectionErrorId) {
            operatorSelectionErrors.push(err);
        }
    });
    return (
        <div className={`govuk-form-group ${operatorSelectionErrors.length > 0 ? 'govuk-form-group--error' : ''}`}>
            <fieldset className="govuk-fieldset" aria-describedby="operator-search-results">
                <legend className="govuk-fieldset__legend">
                    <h2 className="govuk-body-l govuk-!-margin-bottom-0" id="operator-search-results">
                        Your search for <strong>{searchText}</strong> returned
                        <strong>
                            {' '}
                            {searchResults.length} result{searchResults.length > 1 ? 's' : ''}
                        </strong>
                    </h2>
                </legend>
                <FormElementWrapper errors={operatorSelectionErrors} errorId={operatorSelectionErrorId} errorClass="">
                    <>
                        <div className="govuk-checkboxes">
                            <p className="govuk-hint" id="operator-hint-text">
                                Select the operators results and click add operator(s). This data is taken from the
                                Traveline National Dataset.
                            </p>
                            {searchResults.map((operator, index) => {
                                const { nocCode, operatorPublicName } = operator;
                                return (
                                    <div className="govuk-checkboxes__item" key={`checkbox-item-${operatorPublicName}`}>
                                        <input
                                            className="govuk-checkboxes__input"
                                            id={`checkbox-${index}`}
                                            name="selectedOperators"
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
                    </>
                </FormElementWrapper>
                <div className="govuk-!-margin-top-7">
                    <input
                        type="submit"
                        value="Add Operator(s)"
                        id="add-operator-button"
                        className="govuk-button govuk-button--secondary"
                    />
                </div>
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
    const selectedOperatorsToDisplay = selectedOperators.length > 0;
    const searchResultsToDisplay = searchResults.length > 0;
    return (
        <TwoThirdsLayout title={title} description={description}>
            <CsrfForm action="/api/searchOperators" method="post" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={errors} />
                    {selectedOperatorsToDisplay ? showSelectedOperators(selectedOperators, errors) : null}
                    {renderSearchBox(selectedOperatorsToDisplay, errors)}
                    {searchResultsToDisplay ? showSearchResults(searchText, searchResults, errors) : null}
                    {selectedOperatorsToDisplay ? (
                        <div>
                            <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
                        </div>
                    ) : null}
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: SearchOperatorProps }> => {
    const nocCode = getAndValidateNoc(ctx);

    let errors: ErrorInfo[] = [];
    let searchText = '';
    const searchResults: OperatorNameType[] = [];
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
    }

    const { searchOperator } = ctx.query;

    if (searchOperator) {
        searchText = searchOperator ? removeExcessWhiteSpace(searchOperator.toString()) : '';

        if (searchText.length < 3) {
            errors = [
                {
                    errorMessage: 'Search requires a minimum of three characters',
                    id: 'search-input',
                },
            ];
        } else if (searchText.length >= 3) {
            const results = await getSearchOperators(searchText, nocCode);
            const cookies = parseCookies(ctx);
            const operatorName: string = JSON.parse(cookies[OPERATOR_COOKIE]).operator.operatorPublicName;
            results.forEach(operator => {
                if (operator.operatorPublicName !== operatorName) {
                    searchResults.push(operator);
                }
            });
            if (searchResults.length === 0) {
                errors = [
                    {
                        errorMessage: `No operators found for '${searchText}'. Try another search term.`,
                        id: 'search-input',
                    },
                ];
            }
        }
    }

    return { props: { errors, searchText, searchResults, selectedOperators } };
};

export default SearchOperators;
