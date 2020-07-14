import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import { BaseLayout } from '../layout/Layout';
import ErrorSummary from '../components/ErrorSummary';
import { ErrorInfo, CustomAppProps } from '../interfaces';
import FormElementWrapper from '../components/FormElementWrapper';
import CsrfForm from '../components/CsrfForm';
import { SOP_ATTRIBUTE } from '../constants';

const title = 'Sales Offer Package Description - Fares Data Build Tool';
const description = 'Sales Offer Package Description page of the Fares Data Build Tool';

export interface InputCheck {
    error?: string;
    nameInput?: string;
    descriptionInput?: string;
}

interface DescribeSOPProps {
    inputCheck: InputCheck;
    errors: ErrorInfo[];
}

const DescribeSOP = ({ inputCheck, errors, csrfToken }: DescribeSOPProps & CustomAppProps): ReactElement => (
    <BaseLayout title={title} description={description} errors={errors}>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
                <CsrfForm action="/api/describeSalesOfferPackage" method="post" csrfToken={csrfToken}>
                    <>
                        <ErrorSummary errors={errors} />
                        <div className={`govuk-form-group${inputCheck?.error ? ' govuk-form-group--error' : ''}`}>
                            <fieldset className="govuk-fieldset" aria-describedby="page-heading">
                                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                    <h1 className="govuk-fieldset__heading" id="page-heading">
                                        Describe your sales offer package
                                    </h1>
                                </legend>
                                <span className="govuk-hint" id="describe-sop-hint">
                                    Enter a name and description for your sales offer package that means something to
                                    you. This will be displayed back to you when you choose from your saved sales offer
                                    packages.
                                </span>
                                <div className="govuk-form-group">
                                    <label className="govuk-label" htmlFor="sop-name">
                                        Name
                                    </label>
                                    <FormElementWrapper
                                        errors={errors}
                                        errorId="sop-name-error"
                                        errorClass="govuk-input--error"
                                    >
                                        <input
                                            className="govuk-input"
                                            id="sop-name"
                                            name="salesOfferPackageName"
                                            type="text"
                                            defaultValue={!inputCheck?.error ? inputCheck?.nameInput : ''}
                                            aria-describedby={inputCheck?.error ? `describe-sop-name-error` : ''}
                                        />
                                    </FormElementWrapper>
                                </div>
                                <div className="govuk-form-group">
                                    <label className="govuk-label" htmlFor="sop-description">
                                        Description
                                    </label>
                                    <FormElementWrapper
                                        errors={errors}
                                        errorId="sop-description-error"
                                        errorClass="govuk-textarea--error"
                                    >
                                        <textarea
                                            className="govuk-textarea"
                                            id="sop-description"
                                            name="salesOfferPackageDescription"
                                            rows={4}
                                            aria-describedby={inputCheck?.error ? `sop-description-error` : ''}
                                        />
                                    </FormElementWrapper>
                                </div>
                            </fieldset>
                        </div>
                        <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
                    </>
                </CsrfForm>
            </div>
            <div className="govuk-grid-column-one-third">
                <h1 className="govuk-heading-s">What is a Sales Offer Package?</h1>
                <div className="govuk-body">
                    <p>To create NeTEx for a certain ticket type, you must provide the following detail:</p>
                    <ol>
                        <li>Where the ticket can be bought</li>
                        <li>What payment methods can be used to buy the ticket</li>
                        <li>In what format the ticket will be used by passengers</li>
                    </ol>
                    <p>
                        This combination of information is known as a <b>sales offer package</b>.
                    </p>
                </div>
            </div>
        </div>
    </BaseLayout>
);

export const getServerSideProps = (ctx: NextPageContext): {} => {
    const cookies = parseCookies(ctx);
    const salesOfferPackageInfo = cookies[SOP_ATTRIBUTE];
    let inputCheck: InputCheck = {};
    let errors: ErrorInfo[] = [];

    if (salesOfferPackageInfo) {
        inputCheck = JSON.parse(salesOfferPackageInfo);
        errors = inputCheck.error ? [{ errorMessage: inputCheck.error, id: 'how-many-products-error' }] : [];
    }

    return { props: { inputCheck, errors } };
};

export default DescribeSOP;
