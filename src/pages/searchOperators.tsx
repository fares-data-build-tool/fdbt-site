import React, { ReactElement } from 'react';
import TwoThirdsLayout from '../layout/Layout';
import { CustomAppProps, ErrorInfo } from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';

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
                    <input
                        className="govuk-input govuk-!-width-three-quarters"
                        id="event-name"
                        name="event-name"
                        type="text"
                    />
                    <input type="submit" value="Search" id="search-button" className="govuk-button govuk-!-margin-left-5" />
                </div>
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = (): { props: SearchOperatorProps } => {
    return { props: { errors: [] } };
};

export default SearchOperators;
