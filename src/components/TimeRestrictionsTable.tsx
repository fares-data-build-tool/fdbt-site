import React, { ReactElement } from 'react';
import startCase from 'lodash/startCase';
import FormElementWrapper, { FormGroupWrapper } from './FormElementWrapper';
import { ErrorInfo } from '../interfaces';

interface TimeRestrictionsTableProps {
    chosenDays: string[];
    errors: ErrorInfo[];
}

const TimeRestrictionsTable = ({ chosenDays, errors }: TimeRestrictionsTableProps): ReactElement => {
    return (
        <>
            {chosenDays.map((chosenDay, index) => (
                <div className="flex-container" key={chosenDay}>
                    <div className="day-label govuk-body">{startCase(chosenDay)}</div>
                    <div className="">
                        <FormGroupWrapper errors={errors} errorId={`start-time-${chosenDay}`}>
                            <FormElementWrapper
                                errors={errors}
                                errorId={`start-time-${chosenDay}`}
                                errorClass="govuk-input--error"
                            >
                                <>
                                    <label
                                        className={`govuk-label ${index === 0 ? '' : 'govuk-visually-hidden'}`}
                                        htmlFor={`start-time-${chosenDay}`}
                                    >
                                        Start time
                                    </label>
                                    <input
                                        className="govuk-input govuk-input--width-4"
                                        id={`start-time-${chosenDay}`}
                                        name={`startTime${chosenDay}`}
                                        aria-describedby="time-restrictions-hint"
                                        type="text"
                                        defaultValue={
                                            errors.length > 0 &&
                                            errors[index] &&
                                            errors[index].id === `start-time-${chosenDay}`
                                                ? errors[index].userInput
                                                : ''
                                        }
                                    />
                                </>
                            </FormElementWrapper>
                        </FormGroupWrapper>
                    </div>
                    <div className="">
                        <FormGroupWrapper errors={errors} errorId={`end-time-${chosenDay}`}>
                            <FormElementWrapper
                                errors={errors}
                                errorId={`end-time-${chosenDay}`}
                                errorClass="govuk-input--error"
                            >
                                <>
                                    <label
                                        className={`govuk-label ${index === 0 ? '' : 'govuk-visually-hidden'}`}
                                        htmlFor={`end-time-${chosenDay}`}
                                    >
                                        End time
                                    </label>
                                    <input
                                        className="govuk-input govuk-input--width-4"
                                        id={`end-time-${chosenDay}`}
                                        name={`endTime${chosenDay}`}
                                        aria-describedby="time-restrictions-hint"
                                        type="text"
                                        defaultValue={
                                            errors.length > 0 &&
                                            errors[index] &&
                                            errors[index].id === `end-time-${chosenDay}`
                                                ? errors[index].userInput
                                                : ''
                                        }
                                    />
                                </>
                            </FormElementWrapper>
                        </FormGroupWrapper>
                    </div>
                </div>
            ))}
        </>
    );
};

export default TimeRestrictionsTable;
