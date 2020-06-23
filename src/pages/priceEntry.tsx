import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import ErrorSummary from '../components/ErrorSummary';
import { FullColumnLayout } from '../layout/Layout';
import { STAGE_NAMES_COOKIE, PRICE_ENTRY_COOKIE } from '../constants';
import CsrfForm from '../components/CsrfForm';
import { CustomAppProps, ErrorInfo } from '../interfaces';
import { FaresInformation } from './api/priceEntry';

const title = 'Price Entry Fares Triangle - Fares Data Build Tool';
const description = 'Price Entry page of the Fares Data Build Tool';

const errorId = '';

interface PriceEntryProps {
    stageNamesArray: string[];
    inputs?: FaresInformation;
    errors?: ErrorInfo[];
}

export const getDefaultValue = (fareInformation: FaresInformation, rowStage: string, columnStage: string): string => {
    if (!fareInformation) {
        return '';
    }
    const cellName = `${rowStage}-${columnStage}`;
    const defaultInput = fareInformation.inputs.find(input => {
        return input.fieldName === cellName;
    });

    return defaultInput?.input || '';
};

const PriceEntry = ({
    stageNamesArray,
    csrfToken,
    inputs,
    errors = [],
}: PriceEntryProps & CustomAppProps): ReactElement => (
    <FullColumnLayout title={title} description={description}>
        <CsrfForm action="/api/priceEntry" method="post" csrfToken={csrfToken}>
            <>
                <ErrorSummary errors={errors} />
                <div className="govuk-form-group">
                    <fieldset className="govuk-fieldset" aria-describedby="price-entry-page-heading">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                            <h1 className="govuk-fieldset__heading" id="price-entry-page-heading">
                                Enter the prices for all fare stages in pence
                            </h1>
                        </legend>
                        <span className="govuk-hint" id="price-entry-hint">
                            Example: £2.40 would be 240
                        </span>
                    </fieldset>
                    <div className="fare-triangle-container">
                        <div className="fare-triangle-column">
                            {stageNamesArray.map((rowStage, rowIndex) => (
                                <div
                                    className="govuk-heading-s fare-triangle-label-left"
                                    key={stageNamesArray[rowIndex]}
                                >
                                    <span>{rowIndex > 0 ? rowStage : null}</span>
                                </div>
                            ))}
                        </div>
                        <div className="fare-triangle">
                            {stageNamesArray.map((rowStage, rowIndex) => (
                                <div
                                    id={`row-${rowIndex}`}
                                    className="fare-triangle-row"
                                    key={stageNamesArray[rowIndex]}
                                >
                                    {stageNamesArray.slice(0, rowIndex).map((columnStage, columnIndex) => (
                                        <input
                                            className={`govuk-input govuk-input--width-4 fare-triangle-input ${
                                                rowIndex % 2 === 0
                                                    ? 'fare-triangle-input-white'
                                                    : 'fare-triangle-input-light-grey'
                                            }`}
                                            id={`cell-${rowIndex}-${columnIndex}`}
                                            name={`${rowStage}-${columnStage}`}
                                            type="text"
                                            key={stageNamesArray[columnIndex]}
                                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                            defaultValue={getDefaultValue(inputs!, rowStage, columnStage)}
                                        />
                                    ))}
                                    <div className="govuk-heading-s fare-triangle-label-right">{rowStage}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </FullColumnLayout>
);

export const getServerSideProps = (ctx: NextPageContext): { props: PriceEntryProps } => {
    const cookies = parseCookies(ctx);
    const stageNamesCookie = cookies[STAGE_NAMES_COOKIE];
    const priceEntryCookie = cookies[PRICE_ENTRY_COOKIE];

    if (!stageNamesCookie) {
        throw new Error('Necessary stage names cookies not found to show price entry page');
    }

    const stageNamesArray = JSON.parse(stageNamesCookie);

    if (stageNamesArray.length === 0 && ctx.res) {
        throw new Error('No stages in cookie data');
    }

    if (priceEntryCookie) {
        const priceEntryCookieContents: FaresInformation = JSON.parse(priceEntryCookie);
        const errors: ErrorInfo[] = priceEntryCookieContents.errorInformation.map(error => {
            return { errorMessage: error.errorMessage, id: errorId };
        });
        return { props: { stageNamesArray, inputs: priceEntryCookieContents, errors } };
    }

    return { props: { stageNamesArray } };
};

export default PriceEntry;
