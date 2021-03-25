import React, { ReactElement } from 'react';
import TwoThirdsLayout from '../layout/Layout';
import ErrorSummary from '../components/ErrorSummary';
import RadioConditionalInput from '../components/RadioConditionalInput';
import {
    ErrorInfo,
    NextPageContextWithSession,
    RadioConditionalInputFieldset,
    TimeRestriction,
    TimeRestrictionsDefinitionWithErrors,
    PremadeOperatorList,
} from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import { getSessionAttribute } from '../utils/sessions';
import { TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE } from '../constants/attributes';
import { getCsrfToken, getErrorsByIds, getNocFromIdToken } from '../utils';
import { getTimeRestrictionByNocCode } from '../data/auroradb';

const title = 'Define Time Restrictions - Create Fares Data Service';
const description = 'Define Time Restrictions page of the Create Fares Data Service';

interface DefineTimeRestrictionsProps {
    errors: ErrorInfo[];
    fieldsets: RadioConditionalInputFieldset[];
    csrfToken: string;
}

export const getFieldsets = (
    errors: ErrorInfo[],
    // premadeOperatorLists: PremadeOperatorList[],
): RadioConditionalInputFieldset[] => {
    const validDaysFieldset: RadioConditionalInputFieldset = {
        heading: {
            id: 'define-valid-days',
            content: 'Is this ticket only valid on certain days or times?',
            hidden: true,
        },
        radios: [
            {
                id: 'premade-time-restriction-yes',
                name: 'timeRestrictionChoice',
                value: 'Premade',
                label: 'Yes',
                inputHint: {
                    id: 'choose-time-restriction-hint',
                    content: 'Select a saved operator list',
                },
                inputType: 'dropdown',
                dataAriaControls: 'premade-time-restriction',
                // inputs: premadeTimeRestrictions,
                // inputs: premadeOperatorLists.map(premadeOperatorList => {{ id: premadeOperatorList.name, name: premadeOperatorList.name, label: 'Operator List 1' }}),
                inputErrors: errors,
            },
            {
                id: 'valid-days-not-required',
                name: 'timeRestrictionChoice',
                value: 'No',
                label: 'No',
            },
        ],
        radioError: getErrorsByIds(['valid-days-required'], errors),
    };
    return [validDaysFieldset];
};

export const isTimeRestrictionsDefinitionWithErrors = (
    timeRestrictionsDefinition: TimeRestriction | TimeRestrictionsDefinitionWithErrors,
): timeRestrictionsDefinition is TimeRestrictionsDefinitionWithErrors =>
    (timeRestrictionsDefinition as TimeRestrictionsDefinitionWithErrors).errors !== undefined;

const SavedOperators = ({ errors = [], fieldsets, csrfToken }: DefineTimeRestrictionsProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} errors={errors}>
        <CsrfForm action="/api/savedOperators" method="post" csrfToken={csrfToken}>
            <>
                <ErrorSummary errors={errors} />
                <div>
                    <h1 className="govuk-heading-l" id="define-time-restrictions-page-heading">
                        Would you like to reuse a saved list of operators that this ticket covers?
                    </h1>
                    {fieldsets.map(fieldset => {
                        return <RadioConditionalInput key={fieldset.heading.id} fieldset={fieldset} />;
                    })}
                </div>
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = async (
    ctx: NextPageContextWithSession,
): Promise<{ props: DefineTimeRestrictionsProps }> => {
    const csrfToken = getCsrfToken(ctx);
    const timeRestrictionsDefinition = getSessionAttribute(ctx.req, TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE);
    const noc = getNocFromIdToken(ctx);
    const timeRestrictions = await getTimeRestrictionByNocCode(noc || '');

    let errors: ErrorInfo[] = [];
    if (timeRestrictionsDefinition && isTimeRestrictionsDefinitionWithErrors(timeRestrictionsDefinition)) {
        errors = timeRestrictionsDefinition.errors;
    }

    const fieldsets: RadioConditionalInputFieldset[] = getFieldsets(
        errors,
        timeRestrictions,
        // timeRestrictionsDefinition,
    );
    return { props: { errors, fieldsets, csrfToken } };
};

export default SavedOperators;
