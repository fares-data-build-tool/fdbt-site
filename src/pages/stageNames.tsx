import React, { ReactElement } from 'react';
import { parseCookies } from 'nookies';
import uniqBy from 'lodash/uniqBy';
import TwoThirdsLayout from '../layout/Layout';
import { FARE_STAGES_COOKIE, STAGE_NAMES_ATTRIBUTE } from '../constants';
import CsrfForm from '../components/CsrfForm';
import { CustomAppProps, ErrorInfo, NextPageContextWithSession } from '../interfaces';
import FormElementWrapper from '../components/FormElementWrapper';
import ErrorSummary from '../components/ErrorSummary';
import { getSessionAttribute } from '../utils/sessions';
import { isInputCheck } from './api/apiUtils/typeChecking';

const title = 'Stage Names - Fares Data Build Tool';
const description = 'Stage Names entry page of the Fares Data Build Tool';

export interface InputCheck {
    error: string;
    input: string;
    id: string;
}

type StageNameProps = {
    numberOfFareStages: number;
    inputChecks: InputCheck[];
    errors: ErrorInfo[];
};

export const renderInputField = (index: number, inputCheck: InputCheck, errors: ErrorInfo[] = []): ReactElement => (
    <div
        className={`govuk-form-group${inputCheck?.error ? ' govuk-form-group--error' : ''}`}
        key={`fare-stage-name-${index + 1}`}
    >
        <label className="govuk-label" htmlFor={`fare-stage-name-${index + 1}`}>
            Fare Stage {index + 1}
        </label>
        <FormElementWrapper
            errors={errors}
            errorClass="govuk-input--error"
            errorId={`fare-stage-name-${index + 1}-error`}
        >
            <input
                className="govuk-input govuk-input--width-30 stage-name-input-field"
                id={`fare-stage-name-${index + 1}`}
                name="stageNameInput"
                type="text"
                defaultValue={!inputCheck?.error ? inputCheck?.input : ''}
                aria-describedby={inputCheck?.error ? `fareStageName${index + 1}-error` : ''}
            />
        </FormElementWrapper>
    </div>
);

export const renderInputFields = (
    numberOfFareStages: number,
    inputChecks: InputCheck[],
    errors: ErrorInfo[],
): ReactElement[] => {
    const elements: ReactElement[] = [];
    for (let i = 0; i < numberOfFareStages; i += 1) {
        elements.push(renderInputField(i, inputChecks[i], errors));
    }

    return elements;
};

export const filterErrors = (errors: ErrorInfo[]): ErrorInfo[] => uniqBy(errors, 'errorMessage');

const StageNames = ({
    numberOfFareStages,
    inputChecks,
    csrfToken,
    errors = [],
}: StageNameProps & CustomAppProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        <CsrfForm action="/api/stageNames" method="post" csrfToken={csrfToken}>
            <>
                <ErrorSummary errors={errors} />
                <fieldset className="govuk-fieldset" aria-describedby="stage-names-input">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                        <h1 className="govuk-fieldset__heading">
                            Enter the names of the fare stages in order from first to last
                        </h1>
                        <p className="govuk-hint">Fare stage names are limited to 30 characters</p>
                    </legend>
                    <div>{renderInputFields(numberOfFareStages, inputChecks, errors)}</div>
                </fieldset>
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): {} => {
    const cookies = parseCookies(ctx);
    const fareStagesCookie = cookies[FARE_STAGES_COOKIE];

    if (!fareStagesCookie) {
        throw new Error('Necessary fare stage cookie not found to show stage names page');
    }

    const fareStagesObject = JSON.parse(fareStagesCookie);
    const numberOfFareStages = Number(fareStagesObject.fareStages);
    const stageNamesInfo = getSessionAttribute(ctx.req, STAGE_NAMES_ATTRIBUTE);

    let inputChecks: InputCheck[] = [];
    if (stageNamesInfo && stageNamesInfo.length > 0 && isInputCheck(stageNamesInfo)) {
        inputChecks = stageNamesInfo;
    }

    if (inputChecks.length > 0) {
        const errors: ErrorInfo[] = [];
        inputChecks.forEach(inputCheck => {
            if (inputCheck.error !== '') {
                errors.push({ errorMessage: inputCheck.error, id: inputCheck.id });
            }
        });
        return { props: { numberOfFareStages, inputChecks, errors } };
    }

    return { props: { numberOfFareStages, inputChecks, errors: [] } };
};

export default StageNames;
