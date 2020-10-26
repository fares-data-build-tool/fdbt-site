import React, { ReactElement } from 'react';
import { getSessionAttribute, updateSessionAttribute } from '../utils/sessions';
import { MULTIPLE_OPERATOR_ATTRIBUTE, MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE } from '../constants';
import { isMultiOperatorInfoWithErrors } from '../interfaces/typeGuards';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import { FullColumnLayout } from '../layout/Layout';
import { ServiceType, getServicesByNocCode } from '../data/auroradb';
import { CustomAppProps, ErrorInfo, NextPageContextWithSession, MultiOperatorInfo } from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import { MultipleOperatorsAttribute } from './api/searchOperators';

const pageTitle = 'Multiple Operators Service List - Create Fares Data Service';
const pageDescription = 'Multiple Operators Service List selection page of the Create Fares Data Service';

export interface ServicesInfo extends ServiceType {
    checked?: boolean;
}

export interface MultipleOperatorsServiceListProps {
    serviceList: ServicesInfo[];
    buttonText: string;
    errors: ErrorInfo[];
    operatorName: string;
    nocCode: string;
}

const MultipleOperatorsServiceList = ({
    serviceList,
    buttonText,
    csrfToken,
    errors,
    operatorName,
    nocCode,
}: MultipleOperatorsServiceListProps & CustomAppProps): ReactElement => (
    <FullColumnLayout title={pageTitle} description={pageDescription}>
        <CsrfForm action="/api/multipleOperatorsServiceList" method="post" csrfToken={csrfToken}>
            <>
                <ErrorSummary errors={errors} />
                <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                    <fieldset className="govuk-fieldset">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                            <h1 className="govuk-heading-l" id="service-list-page-heading">
                                Which services on {operatorName} is the ticket valid for?
                            </h1>
                        </legend>

                        <span className="govuk-heading-s">Select all services that apply</span>

                        <input
                            type="submit"
                            name="selectAll"
                            value={buttonText}
                            id="select-all-button"
                            className="govuk-button govuk-button--secondary"
                        />
                        <span className="govuk-hint" id="traveline-hint">
                            This data is taken from the Traveline National Dataset.
                        </span>
                        <FormElementWrapper
                            errors={errors}
                            errorId="checkbox-0"
                            errorClass=""
                            addFormGroupError={false}
                        >
                            <div className="govuk-checkboxes">
                                {serviceList.map((service, index) => {
                                    const { lineName, startDate, serviceCode, description, checked } = service;

                                    let checkboxTitles = `${lineName} - ${description} (Start Date ${startDate})`;

                                    if (checkboxTitles.length > 110) {
                                        checkboxTitles = `${checkboxTitles.substr(0, checkboxTitles.length - 10)}...`;
                                    }
                                    const checkBoxValues = `${description}`;

                                    return (
                                        <div className="govuk-checkboxes__item" key={`checkbox-item-${lineName}`}>
                                            <input
                                                className="govuk-checkboxes__input"
                                                id={`checkbox-${index}`}
                                                name={`${nocCode}#${lineName}#${serviceCode}#${startDate}`}
                                                type="checkbox"
                                                value={checkBoxValues}
                                                defaultChecked={checked}
                                            />
                                            <label
                                                className="govuk-label govuk-checkboxes__label"
                                                htmlFor={`checkbox-${index}`}
                                            >
                                                {checkboxTitles}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </FormElementWrapper>
                    </fieldset>
                </div>
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </FullColumnLayout>
);

export const getServerSideProps = async (
    ctx: NextPageContextWithSession,
): Promise<{ props: MultipleOperatorsServiceListProps }> => {
    const searchedOperators = (getSessionAttribute(ctx.req, MULTIPLE_OPERATOR_ATTRIBUTE) as MultipleOperatorsAttribute)
        .selectedOperators;

    const completedOperatorInfo = getSessionAttribute(ctx.req, MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE);

    let doneOperators: MultiOperatorInfo[] = [];

    if (isMultiOperatorInfoWithErrors(completedOperatorInfo)) {
        doneOperators = completedOperatorInfo.multiOperatorInfo;
    } else if (completedOperatorInfo) {
        doneOperators = completedOperatorInfo;
    }

    let [operatorToUse] = searchedOperators;
    if (doneOperators.length > 0) {
        const searchedOperatorsNocs = searchedOperators.map(operator => operator.nocCode);
        const doneOperatorsNocs = doneOperators.map(operator => operator.nocCode);
        const result = searchedOperatorsNocs.find(searchedNoc => {
            return !doneOperatorsNocs.includes(searchedNoc);
        });
        if (!result) {
            updateSessionAttribute(ctx.req, MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE, undefined);
        }
        const foundOperator = searchedOperators.find(operator => operator.nocCode === result);
        if (!foundOperator) {
            updateSessionAttribute(ctx.req, MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE, undefined);
        } else {
            operatorToUse = foundOperator;
        }
    }

    if (!operatorToUse) {
        throw new Error('Necessary operator not found to show multipleOperatorsServiceList page');
    }

    const services = await getServicesByNocCode(operatorToUse.nocCode);

    if (!services) {
        throw new Error(`No services found for ${operatorToUse.nocCode}`);
    }

    const { selectAll } = ctx.query;

    const serviceList: ServicesInfo[] = services.map(service => {
        return {
            ...service,
            checked: !selectAll || (selectAll !== 'true' && selectAll !== 'false') ? false : selectAll !== 'false',
        };
    });

    return {
        props: {
            serviceList,
            buttonText: selectAll === 'true' ? 'Unselect All Services' : 'Select All Services',
            errors: isMultiOperatorInfoWithErrors(completedOperatorInfo) ? completedOperatorInfo.errors : [],
            operatorName: operatorToUse.operatorPublicName,
            nocCode: operatorToUse.nocCode,
        },
    };
};

export default MultipleOperatorsServiceList;