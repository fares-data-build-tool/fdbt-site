import React, { ReactElement } from 'react';
import TwoThirdsLayout from '../layout/Layout';
import { CustomAppProps, ErrorInfo, NextPageContextWithSession } from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import { getSessionAttribute } from '../utils/sessions';
import { SEARCH_OPERATOR_ATTRIBUTE } from '../constants';
import { isSearchOperatorAttributeWithErrors } from '../interfaces/typeGuards';

const title = 'Search Operators - Fares Data Build Tool';
const description = 'Search Operators page for the Fares Data Build Tool';

type SearchOperatorProps = {
    errors: ErrorInfo[];
};

const SearchOperators = ({ errors = [], csrfToken }: SearchOperatorProps & CustomAppProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        <ErrorSummary errors={errors} />
        <CsrfForm action="/api/searchOperators" method="post" csrfToken={csrfToken}>
            <>
                <div className="govuk-form-group">
                    <h1 className="govuk-label-wrapper">
                        <label className="govuk-label govuk-label--l" htmlFor="event-name">
                            Search for the operators that the ticket covers
                        </label>
                    </h1>
                    <FormElementWrapper errors={errors} errorId="searchText" errorClass="govuk-input--error">
                        <>
                            <input
                                className="govuk-input govuk-!-width-three-quarters"
                                id="searchText"
                                name="searchText"
                                type="text"
                            />
                            <input
                                type="submit"
                                value="Search"
                                id="search-button"
                                className="govuk-button govuk-!-margin-left-5"
                            />
                        </>
                    </FormElementWrapper>
                </div>
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: SearchOperatorProps } => {
    const searchOperatorsAttribute = getSessionAttribute(ctx.req, SEARCH_OPERATOR_ATTRIBUTE);

    if (isSearchOperatorAttributeWithErrors(searchOperatorsAttribute) && searchOperatorsAttribute.errors.length > 0) {
        const { errors } = searchOperatorsAttribute;
        return {
            props: {
                errors,
            },
        };
    }

    return { props: { errors: [] } };
};

export default SearchOperators;
