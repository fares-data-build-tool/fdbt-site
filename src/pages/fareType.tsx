import React, { ReactElement } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { NextContextWithSession, ErrorInfo, CustomAppProps } from '../interfaces';
import TwoThirdsLayout from '../layout/Layout';
import { FARE_TYPE_ATTRIBUTE, OPERATOR_ATTRIBUTE } from '../constants';
import ErrorSummary from '../components/ErrorSummary';
import { getAttributeFromIdToken } from '../utils/index';
import FormElementWrapper from '../components/FormElementWrapper';
import CsrfForm from '../components/CsrfForm';
import { getSessionAttributes, updateSessionAttribute } from '../utils/sessions';

const title = 'Fare Type - Fares Data Build Tool';
const description = 'Fare Type selection page of the Fares Data Build Tool';

const errorId = 'fare-type-error';

type FareTypeProps = {
    operator: string;
    errors: ErrorInfo[];
};

export const buildUuid = (ctx: NextContextWithSession): string => {
    const uuid = uuidv4();
    const noc = getAttributeFromIdToken(ctx.req, 'custom:noc');
    return noc + uuid.substring(0, 8);
};

const FareType = ({ operator, errors = [], csrfToken }: FareTypeProps & CustomAppProps): ReactElement => {
    return (
        <TwoThirdsLayout title={title} description={description} errors={errors}>
            <CsrfForm action="/api/fareType" method="post" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={errors} />
                    <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <fieldset className="govuk-fieldset" aria-describedby="fare-type-page-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h1 className="govuk-fieldset__heading" id="fare-type-page-heading">
                                    Select a fare type
                                </h1>
                            </legend>
                            <span className="govuk-hint" id="fare-type-operator-hint">
                                {operator}
                            </span>
                            <FormElementWrapper errors={errors} errorId={errorId} errorClass="govuk-radios--error">
                                <div className="govuk-radios">
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="fare-type-single"
                                            name="fareType"
                                            type="radio"
                                            value="single"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="fare-type-single">
                                            Single Ticket - Point to Point
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="fare-type-period"
                                            name="fareType"
                                            type="radio"
                                            value="period"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="fare-type-period">
                                            Period Ticket (Day, Week, Month and Annual)
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="fare-type-return"
                                            name="fareType"
                                            type="radio"
                                            value="return"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="fare-type-return">
                                            Return Ticket - Single Service
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="fare-type-flat-fare"
                                            name="fareType"
                                            type="radio"
                                            value="flatFare"
                                        />
                                        <label
                                            className="govuk-label govuk-radios__label"
                                            htmlFor="fare-type-flat-fare"
                                        >
                                            Flat Fare Ticket - Single Journey
                                        </label>
                                    </div>
                                </div>
                            </FormElementWrapper>
                        </fieldset>
                    </div>
                    <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = (ctx: NextContextWithSession): {} => {
    const { req } = ctx;

    const { operator } = getSessionAttributes(req, [OPERATOR_ATTRIBUTE]);

    if (!operator) {
        throw new Error('Operator needed for fareType page and not found');
    }

    const uuid = buildUuid(ctx);
    updateSessionAttribute(req, OPERATOR_ATTRIBUTE, { operator, uuid });

    console.info('transaction start', { uuid });

    const fareTypeInfo = getSessionAttributes(req, [FARE_TYPE_ATTRIBUTE]);

    if (fareTypeInfo) {
        if (fareTypeInfo.errorMessage) {
            const { errorMessage } = fareTypeInfo;
            return { props: { operator: operator.operatorPublicName, errors: [{ errorMessage, id: errorId }] } };
        }
    }
    return { props: { operator: operator.operatorPublicName } };
};

export default FareType;
