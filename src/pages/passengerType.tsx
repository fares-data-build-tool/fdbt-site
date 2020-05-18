import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import Layout from '../layout/Layout';
import { PASSENGERTYPE_COOKIE, FARETYPE_COOKIE } from '../constants';
import { ErrorInfo } from '../types';
import ErrorSummary from '../components/ErrorSummary';
import { deleteCookieOnServerSide, buildTitle, unescapeAndDecodeCookieServerSide } from '../utils/index';
import FormElementWrapper from '../components/FormElementWrapper';

const title = 'Passenger Type - Fares Data Build Tool';
const description = 'Passenger Type selection page of the Fares Data Build Tool';

const errorId = 'passenger-type-error';

type PassengerTypeProps = {
    fareType: string;
    errors?: ErrorInfo[];
};

const PassengerType = ({ errors = [] }: PassengerTypeProps): ReactElement => {
    return (
        <Layout title={buildTitle(errors, title)} description={description}>
            <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
                <form action="/api/passengerType" method="post">
                    <ErrorSummary errors={errors} />
                    <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <fieldset className="govuk-fieldset" aria-describedby="passenger-type-page-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                <h1 className="govuk-fieldset__heading" id="passenger-type-page-heading">
                                    Select a passenger type
                                </h1>
                            </legend>
                            <span className="govuk-hint" id="passenger-type-hint">
                                Relate the ticket(s) to a passenger type
                            </span>
                            <FormElementWrapper errors={errors} errorId={errorId} errorClass="govuk-radios--error">
                                <div className="govuk-radios">
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="passenger-type-any"
                                            name="passengerType"
                                            type="radio"
                                            value="any"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="passenger-type-any">
                                            Any Passenger
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="passenger-type-adult"
                                            name="passengerType"
                                            type="radio"
                                            value="adult"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="passenger-type-adult">
                                            Adult
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="passenger-type-child"
                                            name="passengerType"
                                            type="radio"
                                            value="child"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="passenger-type-child">
                                            Child
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="passenger-type-infant"
                                            name="passengerType"
                                            type="radio"
                                            value="infant"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="passenger-type-infant">
                                            Infant
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="passenger-type-senior"
                                            name="passengerType"
                                            type="radio"
                                            value="senior"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="passenger-type-senior">
                                            Senior
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="passenger-type-schoolPupil"
                                            name="passengerType"
                                            type="radio"
                                            value="schoolPupil"
                                            disabled
                                            aria-disabled="true"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="passenger-type-schoolPupil">
                                            School Pupil
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="passenger-type-student"
                                            name="passengerType"
                                            type="radio"
                                            value="student"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="passenger-type-student">
                                            Student
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="passenger-type-youngPerson"
                                            name="passengerType"
                                            type="radio"
                                            value="youngPerson"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="passenger-type-youngPerson">
                                            Young Person
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="passenger-type-disabled"
                                            name="passengerType"
                                            type="radio"
                                            value="disabled"
                                            disabled
                                            aria-disabled="true"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="passenger-type-disabled">
                                            Disabled
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="passenger-type-disabledCompanion"
                                            name="passengerType"
                                            type="radio"
                                            value="disabledCompanion"
                                            disabled
                                            aria-disabled="true"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="passenger-type-disabledCompanion">
                                            Disabled Companion
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="passenger-type-employee"
                                            name="passengerType"
                                            type="radio"
                                            value="employee"
                                            disabled
                                            aria-disabled="true"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="passenger-type-employee">
                                            Employee
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="passenger-type-military"
                                            name="passengerType"
                                            type="radio"
                                            value="military"
                                            disabled
                                            aria-disabled="true"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="passenger-type-military">
                                            Military
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="passenger-type-jobSeeker"
                                            name="passengerType"
                                            type="radio"
                                            value="jobSeeker"
                                            disabled
                                            aria-disabled="true"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="passenger-type-jobSeeker">
                                            Job Seeker
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="passenger-type-guideDog"
                                            name="passengerType"
                                            type="radio"
                                            value="guideDog"
                                            disabled
                                            aria-disabled="true"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="passenger-type-guideDog">
                                            Guide Dog
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input
                                            className="govuk-radios__input"
                                            id="passenger-type-animal"
                                            name="passengerType"
                                            type="radio"
                                            value="animal"
                                            disabled
                                            aria-disabled="true"
                                        />
                                        <label className="govuk-label govuk-radios__label" htmlFor="passenger-type-animal">
                                            Animal
                                        </label>
                                    </div>
                                </div>
                            </FormElementWrapper>
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

export const getServerSideProps = (ctx: NextPageContext): {props: PassengerTypeProps} => {
    const cookies = parseCookies(ctx);
    const fareTypeCookie = cookies[FARETYPE_COOKIE];

    if (!fareTypeCookie) {
        throw new Error('Necessary FareType cookie not found');
    }

    const fareTypeObject = JSON.parse(fareTypeCookie);
    const {fareType} = fareTypeObject;

    if (cookies[PASSENGERTYPE_COOKIE]) {
        const passengerTypeCookie = unescapeAndDecodeCookieServerSide(cookies, PASSENGERTYPE_COOKIE);
        const parsedPassengerTypeCookie = JSON.parse(passengerTypeCookie);

        if (parsedPassengerTypeCookie.errorMessage) {
            const { errorMessage } = parsedPassengerTypeCookie;
            deleteCookieOnServerSide(ctx, PASSENGERTYPE_COOKIE);
            return { props: { fareType, errors: [{ errorMessage, id: errorId }] } };
        }
    }

    return { props: {fareType} };
};

export default PassengerType;
