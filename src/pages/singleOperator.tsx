import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import Layout from '../layout/Layout';
import { OPERATOR_COOKIE, PERIOD_SINGLE_OPERATOR_SERVICES } from '../constants';
import { getServicesByNocCode } from '../data/dynamodb';
import { ServiceLists, ServicesInfo } from '../interfaces';

const title = 'Which service(s) is the ticket valid for';
const description = 'Single Operator selection page of the Fares data build tool';

const SingleOperator = ({ error, selectedServices }: ServiceLists): ReactElement => {
    return (
        <Layout title={title} description={description}>
            <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
                <form action="/api/singleOperator" method="post">
                    <div className={`govuk-form-group ${error ? ' govuk-form-group--error' : ''}`}>
                        <fieldset className="govuk-fieldset" aria-describedby="periodtype-page-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                <h1 className="govuk-fieldset__heading" id="periodtype-page-heading">
                                    Which service(s)?
                                </h1>
                            </legend>
                            <span id="radio-error" className="govuk-error-message">
                                <span className={error ? '' : 'govuk-visually-hidden'}>Please select an option</span>
                            </span>
                        </fieldset>
                        <fieldset className="govuk-fieldset" aria-describedby="waste-hint">
                            <span id="waste-hint" className="govuk-hint">
                                Select all service that apply
                            </span>
                            <input
                                type="submit"
                                name="selectAll"
                                value="Select All"
                                id="select-all-button"
                                className="govuk-button govuk-button--secondary"
                            />
                            <div className="govuk-checkboxes">
                                {selectedServices.map((service, index) => {
                                    const { lineName, startDate, checked } = service;

                                    let checkboxTitles = `${lineName}-${description}-${startDate}`;

                                    if (checkboxTitles.length > 80) {
                                        checkboxTitles = `${checkboxTitles.substr(0, checkboxTitles.length - 10)}...`;
                                    }

                                    return (
                                        <div className="govuk-checkboxes__item" key={`chexkbox-item-${lineName}`}>
                                            <input
                                                className="govuk-checkboxes__input"
                                                id={`checkbox-${index}`}
                                                name={lineName}
                                                type="checkbox"
                                                value={startDate}
                                                defaultChecked={checked}
                                            />
                                            <label className="govuk-label govuk-checkboxes__label" htmlFor={lineName}>
                                                {checkboxTitles}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
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
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: ServiceLists }> => {
    const cookies = parseCookies(ctx);
    const operatorCookie = cookies[OPERATOR_COOKIE];
    const periodSingleOperatorCookie = cookies[PERIOD_SINGLE_OPERATOR_SERVICES];

    if (!operatorCookie) {
        throw new Error('Failed to retrieve operator cookie for single operator page');
    }

    const operatorObject = JSON.parse(operatorCookie);

    const { nocCode } = operatorObject;
    const servicesList = await getServicesByNocCode(nocCode);

    const { selectAll } = ctx.query;
    const checkedServiceList: ServicesInfo[] = servicesList.map(service => {
        return {
            ...service,
            checked: selectAll !== 'false',
        };
    });

    if (!periodSingleOperatorCookie) {
        return {
            props: {
                error: false,
                selectedServices: checkedServiceList,
            },
        };
    }

    const periodSingleOperatorObject = JSON.parse(periodSingleOperatorCookie);

    const { error } = periodSingleOperatorObject;

    return {
        props: {
            error,
            selectedServices: checkedServiceList,
        },
    };
};

export default SingleOperator;
