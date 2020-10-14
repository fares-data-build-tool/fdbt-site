import React, { ReactElement } from 'react';
import { getSessionAttribute } from '../utils/sessions';
import { MULTI_OPERATOR_SERVICES_ATTRIBUTE, COMPLETED_SERVICES_OPERATORS } from '../constants';
import { isMultiOperatorInfoWithErrors } from '../interfaces/typeGuards';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import { FullColumnLayout } from '../layout/Layout';
import { ServiceType, getServicesByNocCode } from '../data/auroradb';
import { CustomAppProps, ErrorInfo, NextPageContextWithSession } from '../interfaces';
import CsrfForm from '../components/CsrfForm';

const pageTitle = 'Multiple Operators Service List - Fares Data Build Tool';
const pageDescription = 'Multiple Operators Service List selection page of the Fares Data Build Tool';

export interface ServicesInfo extends ServiceType {
    checked?: boolean;
}

export interface MultipleOperatorsServiceListProps {
    serviceList: ServicesInfo[];
    buttonText: string;
    errors: ErrorInfo[];
    operatorName: string;
}

const MultipleOperatorsServiceList = ({
    serviceList,
    buttonText,
    csrfToken,
    errors,
    operatorName,
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
                                                name={`${lineName}#${serviceCode}#${startDate}`}
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
    const multiOperatorInfo = getSessionAttribute(ctx.req, MULTI_OPERATOR_SERVICES_ATTRIBUTE);
    const operatorsFound = [
        { operatorPublicName: 'Blackpool', nocCode: 'BLAC' },
        { operatorPublicName: 'Warrington', nocCode: 'WBTR' },
    ];
    const completedOperators = getSessionAttribute(ctx.req, COMPLETED_SERVICES_OPERATORS);

    let operatorToUse;

    if (!completedOperators) {
        [operatorToUse] = operatorsFound;
    } else {
        operatorToUse = operatorsFound.forEach(service =>
            completedOperators.find(operator => operator !== service.nocCode),
        );
    }

    if (operatorsFound.length === 0 || !operatorToUse) {
        throw new Error('Necessary list of operators not found to show multipleOperatorsServiceList page');
    }

    const services = await getServicesByNocCode(operatorToUse.nocCode);

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
            errors: isMultiOperatorInfoWithErrors(multiOperatorInfo) ? multiOperatorInfo.errors : [],
            operatorName: operatorToUse.operatorPublicName,
        },
    };
};

export default MultipleOperatorsServiceList;
