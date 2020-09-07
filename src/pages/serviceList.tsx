import React, { ReactElement } from 'react';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import { FullColumnLayout } from '../layout/Layout';
import { SERVICE_LIST_ATTRIBUTE } from '../constants';
import { getServicesByNocCode } from '../data/auroradb';
import { CustomAppProps, ErrorInfo, NextPageContextWithSession, ServicesInfo } from '../interfaces';
import { getAndValidateNoc } from '../utils';
import CsrfForm from '../components/CsrfForm';
import { getSessionAttribute } from '../utils/sessions';
import { isWithErrors } from '../interfaces/typeGuards';

const pageTitle = 'Service List - Fares Data Build Tool';
const pageDescription = 'Service List selection page of the Fares Data Build Tool';

interface ServiceListProps {
    serviceList: ServicesInfo[];
    buttonText: string;
    errors: ErrorInfo[];
}

const ServiceList = ({
    serviceList,
    buttonText,
    csrfToken,
    errors,
}: ServiceListProps & CustomAppProps): ReactElement => (
    <FullColumnLayout title={pageTitle} description={pageDescription}>
        <CsrfForm action="/api/serviceList" method="post" csrfToken={csrfToken}>
            <>
                <ErrorSummary errors={errors} />
                <div className="govuk-form-group">
                    <fieldset className="govuk-fieldset" aria-describedby="service-list-page-heading">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                            <h1 className="govuk-fieldset__heading" id="service-list-page-heading">
                                Which service(s) is the ticket valid for?
                            </h1>
                        </legend>
                        <span id="radio-error" className="govuk-error-message">
                            <span className={errors.length > 0 ? '' : 'govuk-visually-hidden'}>
                                {errors[0] ? errors[0].errorMessage : ''}
                            </span>
                        </span>
                    </fieldset>
                    <fieldset className="govuk-fieldset" aria-describedby="service-list-hint">
                        <span id="service-list-hint" className="govuk-hint">
                            Select all services that apply
                        </span>
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
                            errorId={errors[0] ? errors[0].id : ''}
                            errorClass="govuk-form-group--error"
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

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: ServiceListProps }> => {
    const nocCode = getAndValidateNoc(ctx);
    const serviceListAttribute = getSessionAttribute(ctx.req, SERVICE_LIST_ATTRIBUTE);

    if (!nocCode) {
        throw new Error('Necessary cookies not found to show serviceList page');
    }

    const services = await getServicesByNocCode(nocCode);

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
            buttonText: selectAll === 'true' ? 'Unselect All' : 'Select All',
            errors: serviceListAttribute && isWithErrors(serviceListAttribute) ? serviceListAttribute.errors : [],
        },
    };
};

export default ServiceList;
