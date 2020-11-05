import React, { ReactElement, useState, useCallback, useEffect } from 'react';
import ErrorSummary from './ErrorSummary';
import FormElementWrapper from './FormElementWrapper';
import { FullColumnLayout } from '../layout/Layout';
import MatchingList from './MatchingList';
import { UserFareStages } from '../data/s3';
import { Stop } from '../data/auroradb';
import { BasicService, ErrorInfo } from '../interfaces';
import CsrfForm from './CsrfForm';

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

    // useEffect(() => {
    //     console.log('selected options use effect', selectedOption);
    // }, [selectedOption]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        console.log('selectedOption======', selectedOption);
        setAutoPopulate(true);
    };

    const selectedValue = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>): void => {
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
        },
        [selectedOption],
    );

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
                                <MatchingList
                                    userFareStages={userFareStages}
                                    stops={stops}
                                    selectedFareStages={selectedFareStages}
                                    selectOptionCallback={selectedValue}
                                    // optionsToPopulate={selectedOption}
                                    // isAutoPopulate={isAutoPopulate}
                                />
                            </FormElementWrapper>
                        </fieldset>
                    </div>

                    <input type="hidden" name="service" value={JSON.stringify(service)} />
                    <input type="hidden" name="userfarestages" value={JSON.stringify(userFareStages)} />
                    <input type="submit" value="Continue" id="submit-button" className="govuk-button" />
                    <button className="govuk-link" type="button" onClick={handleClick}>
                        Auto-complete remaining fare stages
                    </button>
                </>
            </CsrfForm>
        </FullColumnLayout>
    );
};

export default MatchingBase;
