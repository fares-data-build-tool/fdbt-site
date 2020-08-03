import React, { ReactElement } from 'react';
import { getSessionAttribute } from '../utils/sessions';
import TwoThirdsLayout from '../layout/Layout';
import { passengerTypesList, GROUP_PASSENGER_TYPES } from '../constants';
import { ErrorInfo, CustomAppProps, NextPageContextWithSession } from '../interfaces';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import CsrfForm from '../components/CsrfForm';
import { GroupPassengerTypesWithErrors } from './api/defineGroupPassengers';

const title = 'Define Group Passengers - Fares Data Build Tool';
const description = 'Group Passengers selection page of the Fares Data Build Tool';

const errorId = 'passenger-type-error';

export type PassengerAttributes = {
    passengerTypeDisplay: string;
    passengerTypeValue: string;
    greyedOut: boolean;
};

type PassengerTypeProps = {
    errors?: ErrorInfo[];
};

const DefineGroupPassengers = ({ errors = [], csrfToken }: PassengerTypeProps & CustomAppProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} errors={errors}>
        <CsrfForm action="/api/defineGroupPassengers" method="post" csrfToken={csrfToken}>
            <>
                <ErrorSummary errors={errors} />
                <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                    <fieldset className="govuk-fieldset" aria-describedby="passenger-type-page-heading">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                            <h1 className="govuk-fieldset__heading" id="passenger-type-page-heading">
                                Select a passenger type
                            </h1>
                        </legend>
                        <span className="govuk-hint" id="passenger-type-hint">
                            Relate the ticket(s) to a passenger type
                        </span>
                        <FormElementWrapper
                            errors={errors.length ? [{ errorMessage: errors[0].errorMessage || '', id: errorId }] : []}
                            errorId={errorId}
                            errorClass="govuk-checkboxes--error"
                        >
                            <div className="govuk-checkboxes">
                                {passengerTypesList.map(
                                    (passenger, index): ReactElement => (
                                        <div className="govuk-checkboxes__item" key={passenger.passengerTypeValue}>
                                            <input
                                                className="govuk-checkboxes__input"
                                                id={`passenger-type-${index}`}
                                                name="passengerType"
                                                type="checkbox"
                                                value={passenger.passengerTypeValue}
                                                disabled={passenger.greyedOut}
                                                aria-disabled={passenger.greyedOut}
                                            />
                                            <label
                                                className="govuk-label govuk-checkboxes__label"
                                                htmlFor={`passenger-type-${index}`}
                                            >
                                                {`${passenger.passengerTypeDisplay}`}
                                            </label>
                                        </div>
                                    ),
                                )}
                            </div>
                        </FormElementWrapper>
                    </fieldset>
                </div>
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: PassengerTypeProps } => {
    const defineGroupPassengersAttribute = getSessionAttribute(ctx.req, GROUP_PASSENGER_TYPES);
    if (defineGroupPassengersAttribute as GroupPassengerTypesWithErrors) {
        if ((defineGroupPassengersAttribute as GroupPassengerTypesWithErrors).errors) {
            return {
                props: {},
            };
        }
        return {
            props: {
                errors: (defineGroupPassengersAttribute as GroupPassengerTypesWithErrors).errors,
            },
        };
    }
    return {
        props: {},
    };
};

export default DefineGroupPassengers;
