import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import Layout from '../layout/Layout';
import { STAGE_NAMES_COOKIE } from '../constants';

const title = 'Price Entry Fares Triangle - Fares Data Build Tool';
const description = 'Enter prices into fares triangle page of the Fares Data Build Tool';

type PriceEntryProps = {
    stageNamesArray: string[];
};

const PriceEntry = ({ stageNamesArray }: PriceEntryProps): ReactElement => (
    <Layout title={title} description={description}>
        <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
            <form action="/api/priceEntry" method="post">
                <div className="govuk-form-group">
                    <fieldset className="govuk-fieldset" aria-describedby="selection-hint">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                            <h1 className="govuk-fieldset__heading">Enter prices for all fare stages in pence</h1>
                        </legend>
                        <span className="govuk-hint" id="selection-hint">
                            For example £1 would be 100 or £2.29 would be 229
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
                                                    : 'fare-triangle-input-mid-grey'
                                            }`}
                                            id={`cell-${rowIndex}-${columnIndex}`}
                                            name={`${rowStage}-${columnStage}`}
                                            type="number"
                                            min="1"
                                            max="10000"
                                            maxLength={5}
                                            required
                                            pattern="^[0-9]*$"
                                            key={stageNamesArray[columnIndex]}
                                        />
                                    ))}
                                    <div className="govuk-heading-s fare-triangle-label-right">{rowStage}</div>
                                </div>
                            ))}
                        </div>
                    </div>
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

export const getServerSideProps = (ctx: NextPageContext): {} => {
    const cookies = parseCookies(ctx);
    const stageNamesCookie = cookies[STAGE_NAMES_COOKIE];

    if (!stageNamesCookie) {
        throw new Error('Necessary stage names cookies not found to show price entry page');
    }

    const stageNamesArray = JSON.parse(stageNamesCookie);

    if (stageNamesArray.length === 0 && ctx.res) {
        throw new Error('No stages in cookie data');
    }

    return { props: { stageNamesArray } };
};

export default PriceEntry;
