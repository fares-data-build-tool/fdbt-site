import upperFirst from 'lodash/upperFirst';
import React, { ReactElement } from 'react';
import { ExpiryUnit } from '../interfaces';

interface DurationSelectorProps {
    defaultDuration?: string;
    quantityId: string;
    hintId?: string;
    durationName: string;
    defaultUnit?: ExpiryUnit;
    unitName: string;
    unitId: string;
}

const ExpirySelector = ({
    defaultDuration,
    quantityId,
    hintId,
    durationName,
    defaultUnit,
    unitName,
    unitId,
}: DurationSelectorProps): ReactElement => (
    <div className="govuk-input__wrapper">
        <input
            className="govuk-input govuk-input--width-3"
            name={durationName}
            data-non-numeric
            type="text"
            id={quantityId}
            aria-describedby={hintId || ''}
            defaultValue={defaultDuration || ''}
        />
        <select
            className="govuk-select govuk-select--width-3 duration-selector-units"
            name={unitName}
            id={unitId}
            defaultValue={defaultUnit || ''}
        >
            <option value="" disabled>
                Select One
            </option>
            {Object.values(ExpiryUnit).map(unit => (
                <option value={unit}>{upperFirst(unit)}</option>
            ))}
        </select>
    </div>
);

export default ExpirySelector;
