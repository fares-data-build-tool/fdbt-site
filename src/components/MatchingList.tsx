import React, { ReactElement } from 'react';
import { FareStage, UserFareStages } from '../data/s3';
import { Stop } from '../data/auroradb';
import { formatStopName } from '../utils';
import { SelectedValueType } from './MatchingBase';

interface MatchingListProps {
    userFareStages: UserFareStages;
    stops: Stop[];
    selectedFareStages: string[];
    selectOptionCallback: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    optionsToPopulate: SelectedValueType[];
    isAutoPopulate: boolean;
}

const getStopItems = (
    userFareStages: UserFareStages,
    stops: Stop[],
    selectedFareStages: string[],
    selectOptionCallback: (event: React.ChangeEvent<HTMLSelectElement>) => void,
    optionsToPopulate: SelectedValueType[],
    isAutoPopulate: boolean,
): ReactElement[] => {
    // console.log('selectedValueType', optionsToPopulate);
    // console.log('is auto popoulate', isAutoPopulate);
    // console.log('selected farestages', selectedFareStages);
    const stopItems: ReactElement[] = stops.map((stop, index) => {
        let selectValue = '';

        if (isAutoPopulate) {
            if (optionsToPopulate.length === 1) {
                if (index > parseInt(optionsToPopulate[0].position, 10)) {
                    const stageName = JSON.parse(optionsToPopulate[0].value).stage;
                    selectValue = JSON.stringify({ stop, stage: stageName });
                    console.log('select va', JSON.stringify(selectValue));
                    console.log('typer', typeof selectValue);
                }
            }
        }

        if (!isAutoPopulate) {
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
        }

        return (
            <tr key={stop.atcoCode} className="govuk-table__row">
                <td className="govuk-table__cell stop-cell" id={`stop-${index}`}>
                    {formatStopName(stop)}
                </td>
                <td className="govuk-table__cell naptan-cell" id={`naptan-${index}`}>
                    {stop.naptanCode}
                </td>
                <td className="govuk-table__cell stage-cell">
                    {/* eslint-disable-next-line jsx-a11y/no-onchange */}
                    <select
                        className="govuk-select farestage-select"
                        id={`option-${index}`}
                        name={`option-${index}`}
                        defaultValue={selectValue}
                        aria-labelledby={`stop-name-header stop-${index} naptan-code-header naptan-${index}`}
                        onChange={selectOptionCallback}
                    >
                        <option value="notApplicable">Not Applicable</option>
                        {userFareStages.fareStages.map((stage: FareStage) => {
                            console.log('selected value', selectValue);
                            console.log('they equal', JSON.stringify({ stop, stage: stage.stageName }));
                            // console.log('farestages loopp=', selectValue);
                            return (
                                <option
                                    key={stage.stageName}
                                    selected={selectValue === JSON.stringify({ stop, stage: stage.stageName })}
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

const MatchingList = ({
    userFareStages,
    stops,
    selectedFareStages,
    selectOptionCallback,
    optionsToPopulate,
    isAutoPopulate,
}: MatchingListProps): ReactElement => (
    <table className="govuk-table">
        <thead className="govuk-table__head">
            <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header govuk-!-width-one-half" id="stop-name-header">
                    Stop name
                </th>
                <th scope="col" className="govuk-table__header govuk-!-width-one-quarter" id="naptan-code-header">
                    Naptan code
                </th>
                <th scope="col" className="govuk-table__header govuk-!-width-one-quarter" id="fare-stage-header">
                    Fare stage
                </th>
            </tr>
        </thead>
        <tbody className="govuk-table__body">
            {getStopItems(
                userFareStages,
                stops,
                selectedFareStages,
                selectOptionCallback,
                optionsToPopulate,
                isAutoPopulate,
            )}
        </tbody>
    </table>
);

export default MatchingList;
