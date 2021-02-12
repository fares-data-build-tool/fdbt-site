import React, { ReactElement } from 'react';
import upperFirst from 'lodash/upperFirst';
import { ErrorInfo, NextPageContextWithSession, ServiceType } from '../interfaces';
import FormElementWrapper from '../components/FormElementWrapper';
import TwoThirdsLayout from '../layout/Layout';
import { OPERATOR_ATTRIBUTE, SERVICE_ATTRIBUTE, PASSENGER_TYPE_ATTRIBUTE } from '../constants/attributes';
import { getServicesByNocCode } from '../data/auroradb';
import ErrorSummary from '../components/ErrorSummary';
import { getAndValidateNoc, getCsrfToken } from '../utils';
import CsrfForm from '../components/CsrfForm';
import { isPassengerType, isServiceAttributeWithErrors } from '../interfaces/typeGuards';
import { getSessionAttribute } from '../utils/sessions';
import { redirectTo } from './api/apiUtils';

const title = 'Service - Create Fares Data Service';
const description = 'Service selection page of the Create Fares Data Service';
const errorId = 'service';

interface ServiceProps {
    operator: string;
    passengerType: string;
    services: ServiceType[];
    error: ErrorInfo[];
    csrfToken: string;
}

const Service = ({ operator, passengerType, services, error, csrfToken }: ServiceProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} errors={error}>
        <CsrfForm action="/api/service" method="post" csrfToken={csrfToken}>
            <>
                <ErrorSummary errors={error} />
                <div className={`govuk-form-group ${error.length > 0 ? 'govuk-form-group--error' : ''}`}>
                    <label htmlFor="service">
                        <h1 className="govuk-heading-l" id="service-page-heading">
                            Select a service
                        </h1>
                    </label>

                    <span className="govuk-hint" id="service-operator-passenger-type-hint">
                        {operator} - {upperFirst(passengerType)}
                    </span>
                    <FormElementWrapper errors={error} errorId={errorId} errorClass="govuk-select--error">
                        <select className="govuk-select" id="service" name="service" defaultValue="">
                            <option value="" disabled>
                                Select One
                            </option>
                            {services.map(service => (
                                <option
                                    key={`${service.lineName}#${service.startDate}`}
                                    value={`${service.lineName}#${service.startDate}`}
                                    className="service-option"
                                >
                                    {service.lineName} - Start date {service.startDate}
                                </option>
                            ))}
                        </select>
                    </FormElementWrapper>
                    <span className="govuk-hint hint-text" id="traveline-hint">
                        This data is taken from the Traveline National Dataset (TNDS). If any of your services are not
                        listed, contact your local transport authority for further advice.
                    </span>
                </div>
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: ServiceProps }> => {
    const csrfToken = getCsrfToken(ctx);

    const serviceAttribute = getSessionAttribute(ctx.req, SERVICE_ATTRIBUTE);

    const error: ErrorInfo[] =
        serviceAttribute && isServiceAttributeWithErrors(serviceAttribute) ? serviceAttribute.errors : [];

    const operatorAttribute = getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE);
    const nocCode = getAndValidateNoc(ctx);

    const passengerTypeAttribute = getSessionAttribute(ctx.req, PASSENGER_TYPE_ATTRIBUTE);

    if (!operatorAttribute?.name || !isPassengerType(passengerTypeAttribute) || !nocCode) {
        throw new Error('Could not render the service selection page. Necessary attributes not found.');
    }

    const services = await getServicesByNocCode(nocCode);

    if (services.length === 0) {
        if (ctx.res) {
            redirectTo(ctx.res, '/noServices');
        } else {
            throw new Error(`No services found for NOC Code: ${nocCode}`);
        }
    }

    return {
        props: {
            operator: operatorAttribute.name,
            passengerType: passengerTypeAttribute.passengerType,
            services,
            error,
            csrfToken,
        },
    };
};

export default Service;
