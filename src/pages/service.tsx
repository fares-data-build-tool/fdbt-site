import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import Layout from '../layout/Layout';
import { OPERATOR_COOKIE, SERVICE_COOKIE, PASSENGERTYPE_COOKIE } from '../constants';
import { deleteCookieOnServerSide } from '../utils';
import { getServicesByNocCode, ServiceType } from '../data/auroradb';

const title = 'Service - Fares Data Build Tool';
const description = 'Service selection page of the Fares Data Build Tool';

type ServiceProps = {
    operator: string;
    passengerType: string;
    services: ServiceType[];
};

const Service = ({ operator, passengerType, services }: ServiceProps): ReactElement => (
    <Layout title={title} description={description}>
        <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
            <form action="/api/service" method="post">
                <div className="govuk-form-group">
                    <fieldset className="govuk-fieldset" aria-describedby="service-page-heading">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                            <h1 className="govuk-fieldset__heading" id="service-page-heading">
                                Select a service
                            </h1>
                        </legend>
                        <span className="govuk-hint" id="service-operator-hint">
                            {operator} - {passengerType}
                        </span>
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
                        <span className="govuk-hint hint-text" id="traveline-hint">
                            This data is taken from the Traveline National Dataset
                        </span>
                    </fieldset>
                </div>
                <input
                    type="submit"
                    value="Continue"
                    id="continue-button"
                    className="govuk-button govuk-button--start"
                />
            </form>
        </main>
    </Layout>
);

export const getServerSideProps = async (ctx: NextPageContext): Promise<{}> => {
    deleteCookieOnServerSide(ctx, SERVICE_COOKIE);

    const cookies = parseCookies(ctx);
    const operatorCookie = cookies[OPERATOR_COOKIE];
    const passengerTypeCookie = cookies[PASSENGERTYPE_COOKIE];

    if (!operatorCookie || !passengerTypeCookie) {
        throw new Error('Necessary cookies not found to show matching page');
    }

    const operatorInfo = JSON.parse(operatorCookie);
    const passengerTypeInfo = JSON.parse(passengerTypeCookie);

    const services = await getServicesByNocCode(operatorInfo.nocCode);

    if (services.length === 0) {
        throw new Error(`No services found for NOC Code: ${operatorInfo.nocCode}`);
    }

    return { props: { operator: operatorInfo.operator, passengerType: passengerTypeInfo.passengerType, services } };
};

export default Service;
