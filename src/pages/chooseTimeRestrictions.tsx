import React, { ReactElement } from 'react';
import TwoThirdsLayout from '../layout/Layout';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import { ErrorInfo, NextPageContextWithSession, TimeRestriction } from '../interfaces';
import TimeRestrictionsTable from '../components/TimeRestrictionsTable';
import { getCsrfToken } from '../utils';
import { getSessionAttribute } from '../utils/sessions';
import { TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE, FULL_TIME_RESTRICTIONS_ATTRIBUTE } from '../constants';
import { isFullTimeRestrictionsAttribute } from '../interfaces/typeGuards';

const title = 'Choose time restrictions - Create Fares Data Service ';
const description = 'Choose time restrictions page of the Create Fares Data Service';

type ChooseTimeRestrictionsProps = {
    chosenDays: string[];
    errors: ErrorInfo[];
    csrfToken: string;
};

const ChooseTimeRestrictions = ({ chosenDays, errors = [], csrfToken }: ChooseTimeRestrictionsProps): ReactElement => {
    return (
        <TwoThirdsLayout title={title} description={description} errors={errors}>
            <CsrfForm action="/api/chooseTimeRestrictions" method="post" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={errors} />
                    <fieldset className="govuk-fieldset">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                            <h1 className="govuk-fieldset__heading">Tell us more about the time restrictions</h1>
                        </legend>
                        <span className="govuk-hint" id="time-restrictions-hint">
                            Enter the times at which your ticket(s) start and end, if applicable. If they are valid at
                            all times, leave them blank. You can leave them all blank, if needed.
                        </span>
                        <div className="govuk-inset-text">
                            Enter times in 2400 format. For example 0900 is 9am, 1730 is 5:30pm.
                        </div>
                        <TimeRestrictionsTable chosenDays={chosenDays} errors={errors} />
                    </fieldset>
                    <input
                        type="submit"
                        value="Continue"
                        id="continue-button"
                        className="govuk-button continue-button-placement"
                    />
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: ChooseTimeRestrictionsProps } => {
    const csrfToken = getCsrfToken(ctx);
    const chosenDaysAttribute: TimeRestriction = getSessionAttribute(
        ctx.req,
        TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE,
    ) as TimeRestriction;
    if (!chosenDaysAttribute || !chosenDaysAttribute.validDays || chosenDaysAttribute.validDays.length === 0) {
        throw new Error('Necessary list of days not found to render page.');
    }
    const chosenDays = chosenDaysAttribute.validDays;
    const errors: ErrorInfo[] = [];
    const fullTimeRestrictionsAttribute = getSessionAttribute(ctx.req, FULL_TIME_RESTRICTIONS_ATTRIBUTE);
    if (fullTimeRestrictionsAttribute && !isFullTimeRestrictionsAttribute(fullTimeRestrictionsAttribute)) {
        fullTimeRestrictionsAttribute.forEach(error => errors.push(error));
    }
    return { props: { chosenDays, errors, csrfToken } };
};

export default ChooseTimeRestrictions;
