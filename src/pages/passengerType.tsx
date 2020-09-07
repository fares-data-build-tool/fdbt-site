import React, { ReactElement } from 'react';
import TwoThirdsLayout from '../layout/Layout';
import { PASSENGER_TYPE_ATTRIBUTE, PASSENGER_TYPES_WITH_GROUP } from '../constants';
import { ErrorInfo, CustomAppProps, NextPageContextWithSession } from '../interfaces';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import CsrfForm from '../components/CsrfForm';
import InsetText from '../components/InsetText';
import { getSessionAttribute } from '../utils/sessions';
import { isWithErrors } from '../interfaces/typeGuards';

const title = 'Passenger Type - Fares Data Build Tool';
const description = 'Passenger Type selection page of the Fares Data Build Tool';

const errorId = 'passenger-type-error';
const insetText = 'More passenger types will become available soon';

interface PassengerTypeProps {
    errors?: ErrorInfo[];
}

const PassengerType = ({ errors = [], csrfToken }: PassengerTypeProps & CustomAppProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} errors={errors}>
        <CsrfForm action="/api/passengerType" method="post" csrfToken={csrfToken}>
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
                        <FormElementWrapper errors={errors} errorId={errorId} errorClass="govuk-radios--error">
                            <div className="govuk-radios">
                                {PASSENGER_TYPES_WITH_GROUP.map(
                                    (passenger): ReactElement => (
                                        <div className="govuk-radios__item" key={passenger.passengerTypeValue}>
                                            <input
                                                className="govuk-radios__input"
                                                id={`passenger-type-${passenger.passengerTypeValue}`}
                                                name="passengerType"
                                                type="radio"
                                                value={passenger.passengerTypeValue}
                                            />
                                            <label
                                                className="govuk-label govuk-radios__label"
                                                htmlFor={`passenger-type-${passenger.passengerTypeValue}`}
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
                <InsetText text={insetText} />
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): {} => {
    const passengerTypeAttribute = getSessionAttribute(ctx.req, PASSENGER_TYPE_ATTRIBUTE);

    const errors: ErrorInfo[] =
        passengerTypeAttribute && isWithErrors(passengerTypeAttribute) ? passengerTypeAttribute.errors : [];

    return { props: { errors } };
};

export default PassengerType;
