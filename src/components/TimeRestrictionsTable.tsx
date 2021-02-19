import React, { ReactElement, useState } from 'react';
import FormElementWrapper, { FormGroupWrapper } from './FormElementWrapper';
import { ErrorInfo, TimeInput } from '../interfaces';
import { sentenceCaseString } from '../utils';

interface TimeRestrictionsTableProps {
    chosenDays: string[];
    errors: ErrorInfo[];
    startTimeInputs: TimeInput[];
    endTimeInputs: TimeInput[];
    dayCounters: {
        day: string;
        counter: number;
    }[];
}

const findCorrectDefaultValue = (inputs: TimeInput[], chosenDay: string, inputIndex: number): string => {
    return (
        inputs.find((input, index) => input.day === chosenDay && input.timeInput && index === inputIndex)?.timeInput ??
        ''
    );
};

const TimeRestrictionsTable = ({
    chosenDays,
    errors,
    startTimeInputs,
    endTimeInputs,
    dayCounters,
}: TimeRestrictionsTableProps): ReactElement => {
    const defaultState: { [key: string]: number } = {};

    chosenDays.forEach(day => {
        defaultState[day] = 1;
    });

    if (dayCounters && dayCounters.length > 0) {
        dayCounters.forEach(dayCounter => {
            defaultState[dayCounter.day] = dayCounter.counter;
        });
    }

    const [dayRowCount, updateDayRowCount] = useState(defaultState);

    const addTimeRestrictionRow = (day: string): void => {
        if (dayRowCount?.[day] < 5) {
            const dayRowCountToUpdate = { ...dayRowCount };
            dayRowCountToUpdate[day] += 1;
            updateDayRowCount(dayRowCountToUpdate);
        }
    };

    const getTimeRestrictionRows = (chosenDay: string): JSX.Element[] => {
        const rows = [];

        for (let i = 0; i < dayRowCount[chosenDay]; i += 1) {
            rows.push(
                <div className="time-restriction-row" key={i}>
                    <div>
                        <FormGroupWrapper errors={errors} errorId={`start-time-${chosenDay}-${i}`}>
                            <FormElementWrapper
                                errors={errors}
                                errorId={`start-time-${chosenDay}`}
                                errorClass="govuk-input--error"
                            >
                                <>
                                    <label className="govuk-label" htmlFor={`start-time-${chosenDay}`}>
                                        Start time <span className="govuk-visually-hidden">for {chosenDay}</span>
                                    </label>
                                    <input
                                        className="govuk-input govuk-input--width-5 govuk-!-margin-right-4"
                                        id={`start-time-${chosenDay}-${i}`}
                                        name={`startTime${chosenDay}`}
                                        aria-describedby="time-restrictions-hint"
                                        type="text"
                                        defaultValue={findCorrectDefaultValue(startTimeInputs, chosenDay, i)}
                                    />
                                </>
                            </FormElementWrapper>
                        </FormGroupWrapper>
                    </div>
                    <div>
                        <FormGroupWrapper errors={errors} errorId={`end-time-${chosenDay}-${i}`}>
                            <FormElementWrapper
                                errors={errors}
                                errorId={`end-time-${chosenDay}`}
                                errorClass="govuk-input--error"
                            >
                                <>
                                    <label className="govuk-label" htmlFor={`end-time-${chosenDay}`}>
                                        End time <span className="govuk-visually-hidden">for {chosenDay}</span>
                                    </label>
                                    <input
                                        className="govuk-input govuk-input--width-5"
                                        id={`end-time-${chosenDay}-${i}`}
                                        name={`endTime${chosenDay}`}
                                        aria-describedby="time-restrictions-hint"
                                        type="text"
                                        defaultValue={findCorrectDefaultValue(endTimeInputs, chosenDay, i)}
                                    />
                                </>
                            </FormElementWrapper>
                        </FormGroupWrapper>
                    </div>
                </div>,
            );
        }

        return rows;
    };

    return (
        <>
            {chosenDays.map(chosenDay => (
                <>
                    <fieldset className="govuk-fieldset flex-container time-restrictions-table" key={chosenDay}>
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m day-label">
                            {sentenceCaseString(chosenDay)}
                        </legend>
                        <div>{getTimeRestrictionRows(chosenDay)}</div>
                        <button
                            id={`add-another-button-${chosenDay}`}
                            type="button"
                            className="govuk-button govuk-button--secondary govuk-!-margin-left-3 time-restrictions-button-placement"
                            onClick={(): void => addTimeRestrictionRow(chosenDay)}
                        >
                            Add another
                        </button>
                    </fieldset>
                    <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
                </>
            ))}
        </>
    );
};

export default TimeRestrictionsTable;
