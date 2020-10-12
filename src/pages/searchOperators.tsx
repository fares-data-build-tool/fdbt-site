import React, { ReactElement } from 'react';
import { parseCookies } from 'nookies';
import TwoThirdsLayout from '../layout/Layout';
import { CustomAppProps, ErrorInfo, NextPageContextWithSession } from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import { getSessionAttribute, updateSessionAttribute } from '../utils/sessions';
import { MULTIPLE_OPERATOR_ATTRIBUTE, OPERATOR_COOKIE } from '../constants';
import { isSearchOperatorAttributeWithErrors } from '../interfaces/typeGuards';
import { getSearchOperators, Operator } from '../data/auroradb';
import { getAndValidateNoc } from '../utils';
import { removeExcessWhiteSpace } from './api/apiUtils/validator';

const title = 'Search Operators - Fares Data Build Tool';
const description = 'Search Operators page for the Fares Data Build Tool';

export const searchInputId = 'search-input';
export const addOperatorsErrorId = 'add-operator-checkbox-0';
export const removeOperatorsErrorId = 'remove-operator-checkbox-0';

export type SearchOperatorProps = {
    searchText: string;
    errors: ErrorInfo[];
    searchResults: Operator[];
    selectedOperators: Operator[];
};

export const showSelectedOperators = (selectedOperators: Operator[], errors: ErrorInfo[]): ReactElement => {
    const removeOperatorsErrors: ErrorInfo[] = [];
    errors.forEach(err => {
        if (err.id === removeOperatorsErrorId) {
            removeOperatorsErrors.push(err);
        }
    });
    return (
        <div className={`govuk-form-group ${removeOperatorsErrors.length > 0 ? 'govuk-form-group--error' : ''}`}>
            <fieldset className="govuk-fieldset" aria-describedby="selected-operators">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading" id="selected-operators">
                        Here&apos;s what you have added
                    </h1>
                </legend>
                <div className="govuk-inset-text">
                    <FormElementWrapper errors={removeOperatorsErrors} errorId={removeOperatorsErrorId} errorClass="">
                        <div className="govuk-checkboxes">
                            {selectedOperators.map((operator, index) => (
                                <div key={operator.nocCode} className="govuk-checkboxes__item">
                                    <input
                                        className="govuk-checkboxes__input"
                                        id={`remove-operator-checkbox-${index}`}
                                        name="operatorsToRemove"
                                        value={`${operator.nocCode}#${operator.operatorPublicName}`}
                                        type="checkbox"
                                    />
                                    <label
                                        className="govuk-label govuk-checkboxes__label"
                                        htmlFor={`remove-operator-checkbox-${index}`}
                                    >
                                        {operator.operatorPublicName}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </FormElementWrapper>
                    <input
                        type="submit"
                        name="removeOperators"
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
                <input
                    type="submit"
                    value="Search"
                    name="search"
                    id="search-button"
                    className="govuk-button govuk-!-margin-left-5"
                />
            </fieldset>
        </div>
    );
};

export const showSearchResults = (searchText: string, searchResults: Operator[], errors: ErrorInfo[]): ReactElement => {
    const addOperatorsErrors: ErrorInfo[] = [];
    errors.forEach(err => {
        if (err.id === addOperatorsErrorId) {
            addOperatorsErrors.push(err);
        }
    });
    return (
        <div className={`govuk-form-group ${addOperatorsErrors.length > 0 ? 'govuk-form-group--error' : ''}`}>
            <fieldset className="govuk-fieldset" aria-describedby="operator-search-results">
                <legend className="govuk-fieldset__legend">
                    <h2 className="govuk-body-l govuk-!-margin-bottom-0" id="operator-search-results">
                        Your search for &apos;<strong>{searchText}</strong>&apos; returned
                        <strong>
                            {' '}
                            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                        </strong>
                    </h2>
                </legend>
                <FormElementWrapper errors={addOperatorsErrors} errorId={addOperatorsErrorId} errorClass="">
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
                                            id={`add-operator-checkbox-${index}`}
                                            name="operatorsToAdd"
                                            type="checkbox"
                                            value={`${nocCode}#${operatorPublicName}`}
                                        />
                                        <label
                                            className="govuk-label govuk-checkboxes__label"
                                            htmlFor={`add-operator-checkbox-${index}`}
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
                        name="addOperators"
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
    const searchResultsToDisplay = searchResults.length > 0 || errors.find(err => err.id === addOperatorsErrorId);
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
                            <input
                                type="submit"
                                value="Continue"
                                name="continueButtonClick"
                                id="continue-button"
                                className="govuk-button"
                            />
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
    const searchResults: Operator[] = [];

    const searchOperatorsAttribute = getSessionAttribute(ctx.req, MULTIPLE_OPERATOR_ATTRIBUTE);
    const selectedOperators: Operator[] = searchOperatorsAttribute?.selectedOperators
        ? searchOperatorsAttribute.selectedOperators
        : [];

    if (isSearchOperatorAttributeWithErrors(searchOperatorsAttribute)) {
        errors = searchOperatorsAttribute.errors;
        updateSessionAttribute(ctx.req, MULTIPLE_OPERATOR_ATTRIBUTE, { selectedOperators });
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
