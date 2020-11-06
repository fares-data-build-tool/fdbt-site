import React, { ReactElement, useState } from 'react';
import ErrorSummary from './ErrorSummary';
import FormElementWrapper from './FormElementWrapper';
import { FullColumnLayout } from '../layout/Layout';
import { FareStage, UserFareStages } from '../data/s3';
import { Stop } from '../data/auroradb';
import { BasicService, ErrorInfo } from '../interfaces';
import CsrfForm from './CsrfForm';
import { formatStopName } from '../utils';

interface MatchingBaseProps {
    userFareStages: UserFareStages;
    stops: Stop[];
    service: BasicService;
    error: boolean;
    selectedFareStages: string[];
    title: string;
    description: string;
    hintText: string;
    travelineHintText: string;
    heading: string;
    apiEndpoint: string;
    csrfToken: string;
}

export type SelectedValueType = {
    id: string;
    value: string;
    position: string;
};

const MatchingBase = ({
    userFareStages,
    stops,
    service,
    error,
    selectedFareStages,
    title,
    description,
    hintText,
    travelineHintText,
    heading,
    apiEndpoint,
    csrfToken,
}: MatchingBaseProps): ReactElement => {
    const errors: ErrorInfo[] = [];

    const [selectedOption, setSelectedOption] = useState<SelectedValueType[]>([]);
    const [isAutoPopulate, setAutoPopulate] = useState(false);

    const handleAutoPopulate = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
        event.preventDefault();
        console.log('handle auto event');
        setAutoPopulate(true);
    };

    const onChangeSelection = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        console.log('target value', event.target);
        if (event.target.value === 'notApplicable') {
            const index = selectedOption.findIndex(option => {
                return option.id === event.target.id;
            });

            selectedOption.splice(index, 1);
            setSelectedOption(selectedOption);
        } else {
            const valueSelected: SelectedValueType = {
                id: event.target.id,
                value: event.target.value,
                position: event.target.id.split('-')[1],
            };
            setSelectedOption(
                [...selectedOption, valueSelected].sort((a, b) => {
                    return parseFloat(a.position) - parseFloat(b.position);
                }),
            );
        }
    };

    const getStopItems = (): ReactElement[] => {
        const stopItems: ReactElement[] = stops.map((stop, index) => {
            let selectValue = '';

            userFareStages.fareStages.map((stage: FareStage) => {
                const currentValue = JSON.stringify({ stop, stage: stage.stageName });

                const isSelected = selectedFareStages.some(selectedObject => {
                    return selectedObject === currentValue;
                });

                if (isSelected) {
                    selectValue = currentValue;
                }

                return null;
            });

            console.log('selectValue', selectValue);
            return (
                <tr key={stop.atcoCode} className="govuk-table__row">
                    <td className="govuk-table__cell stop-cell" id={`stop-${index}`}>
                        {formatStopName(stop)}
                    </td>
                    <td className="govuk-table__cell naptan-cell" id={`naptan-${index}`}>
                        {stop.naptanCode}
                    </td>
                    <td className="govuk-table__cell stage-cell">
                        <select
                            className="govuk-select farestage-select"
                            id={`option-${index}`}
                            name={`option-${index}`}
                            defaultValue={selectValue}
                            aria-labelledby={`stop-name-header stop-${index} naptan-code-header naptan-${index}`}
                            onBlur={onChangeSelection}
                        >
                            <option value="">Not Applicable</option>
                            {userFareStages.fareStages.map((stage: FareStage) => {
                                return (
                                    <option
                                        key={stage.stageName}
                                        value={JSON.stringify({ stop, stage: stage.stageName })}
                                    >
                                        {stage.stageName}
                                    </option>
                                );
                            })}
                        </select>
                    </td>
                </tr>
            );
        });
        return stopItems;
    };

    if (error) {
        errors.push({ errorMessage: 'Ensure each fare stage is assigned at least once.', id: 'option-0' });
    }

    return (
        <FullColumnLayout title={title} description={description} errors={errors}>
            <CsrfForm action={apiEndpoint} method="post" className="matching-page" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={errors} />
                    <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
                        <fieldset className="govuk-fieldset">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h1 className="govuk-fieldset__heading">{heading}</h1>
                            </legend>
                            <span className="govuk-hint" id="match-fares-hint">
                                {hintText}
                            </span>
                            <span className="govuk-hint" id="traveline-hint">
                                {travelineHintText}
                            </span>
                            <FormElementWrapper errors={errors} errorId="option-0" errorClass="">
                                <table className="govuk-table">
                                    <thead className="govuk-table__head">
                                        <tr className="govuk-table__row">
                                            <th
                                                scope="col"
                                                className="govuk-table__header govuk-!-width-one-half"
                                                id="stop-name-header"
                                            >
                                                Stop name
                                            </th>
                                            <th
                                                scope="col"
                                                className="govuk-table__header govuk-!-width-one-quarter"
                                                id="naptan-code-header"
                                            >
                                                Naptan code
                                            </th>
                                            <th
                                                scope="col"
                                                className="govuk-table__header govuk-!-width-one-quarter"
                                                id="fare-stage-header"
                                            >
                                                Fare stage
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="govuk-table__body">{getStopItems()}</tbody>
                                </table>
                            </FormElementWrapper>
                        </fieldset>
                    </div>

                    <input type="hidden" name="service" value={JSON.stringify(service)} />
                    <input type="hidden" name="userfarestages" value={JSON.stringify(userFareStages)} />
                    <input type="submit" value="Continue" id="submit-button" className="govuk-button" />
                    <button className="govuk-button govuk-!-margin-left-3" type="button" onClick={handleAutoPopulate}>
                        Auto-complete remaining fare stages
                    </button>
                </>
            </CsrfForm>
        </FullColumnLayout>
    );
};

export default MatchingBase;
