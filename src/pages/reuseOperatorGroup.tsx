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
    OperatorGroup,
} from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import { getSessionAttribute } from '../utils/sessions';
import { REUSE_OPERATOR_GROUP_ATTRIBUTE, TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE } from '../constants/attributes';
import { getAndValidateNoc, getCsrfToken, getErrorsByIds, getNocFromIdToken } from '../utils';
import { getOperatorGroupsByNoc } from '../data/auroradb';
import { redirectTo } from './api/apiUtils';

const title = 'Reuse Operator Group - Create Fares Data Service';
const description = 'Reuse Operator Group page of the Create Fares Data Service';

interface DefineTimeRestrictionsProps {
    errors: ErrorInfo[];
    fieldsets: RadioConditionalInputFieldset[];
    csrfToken: string;
}

export const getFieldsets = (errors: ErrorInfo[], operatorGroups: OperatorGroup[]): RadioConditionalInputFieldset[] => {
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
                inputs: operatorGroups.map(operatorGroup => {{ id: operatorGroup.name, name: operatorGroup.name, label: 'Operator List 1' }}),
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
    const noc = getAndValidateNoc(ctx);
    const savedOperatorGroups = await getOperatorGroupsByNoc(noc);

    if (!savedOperatorGroups) {
        if (ctx.res) {
            redirectTo(ctx.res, '/searchOperators');
        } else {
            throw new Error('User has arrived at reuse operator group page with incorrect information.');
        }
    }

    const errors = getSessionAttribute(ctx.req, REUSE_OPERATOR_GROUP_ATTRIBUTE) || [];

    const fieldsets: RadioConditionalInputFieldset[] = getFieldsets(
        errors,
        timeRestrictions,
        // timeRestrictionsDefinition,
    );
    return { props: { errors, fieldsets, csrfToken } };
};

export default ReuseOperatorGroup;
