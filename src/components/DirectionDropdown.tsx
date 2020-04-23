import React, { ReactElement } from 'react';
import { JourneyPattern } from '../data/auroradb';

interface DirectionProps {
    journeyPatterns: JourneyPattern[];
}

const DirectionDropdown = ({journeyPatterns}: DirectionProps): ReactElement => {
    return (<select className="govuk-select" id="journeyPattern" name="journeyPattern" defaultValue="">
        <option value="" disabled>
            Select One
        </option>
        {journeyPatterns.map((journeyPattern, i) => (
            <option
                key={`${journeyPattern.startPoint.Id}#${journeyPattern.endPoint.Id}#${+i}`}
                value={`${journeyPattern.startPoint.Id}#${journeyPattern.endPoint.Id}`}
                className="journey-option"
            >
                {journeyPattern.startPoint.Display} TO {journeyPattern.endPoint.Display}
            </option>
        ))}
    </select>)
};

export default DirectionDropdown;