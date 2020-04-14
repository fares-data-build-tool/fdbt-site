import React, { ReactElement } from 'react';
import Layout from '../layout/Layout';

const title = 'How Many Products - Fares data build tool';
const description = 'How many products page of the Fares data build tool';

const HowManyProducts = (): ReactElement => (
    <Layout title={title} description={description}>
        <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
            <form action="/api/howManyProducts" method="post">
                <div className="govuk-form-group">
                    <fieldset className="govuk-fieldset" aria-describedby="page-heading">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                            <h1 className="govuk-fieldset__heading" id="page-heading">
                                How many products do you have for this zone or selected service?
                            </h1>
                        </legend>

                        <div className="govuk-form-group">
                            <label className="govuk-hint" htmlFor="width-2">
                                Enter the number of products associated with the zone or service selected.
                            </label>
                            <input
                                className="govuk-input govuk-input--width-2"
                                id="numberOfProducts"
                                name="numberOfProductsInput"
                                type="number"
                                min="1"
                                max="20"
                                maxLength={2}
                                required
                                pattern="^[0-9]*$"
                            />
                        </div>
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

export default HowManyProducts;
