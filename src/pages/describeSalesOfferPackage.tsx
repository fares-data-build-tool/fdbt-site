import React, { ReactElement } from 'react';
import { BaseLayout } from '../layout/Layout';
import ErrorSummary from '../components/ErrorSummary';
import { ErrorInfo, CustomAppProps, NextPageContextWithSession } from '../interfaces';
import FormElementWrapper from '../components/FormElementWrapper';
import CsrfForm from '../components/CsrfForm';
import { SOP_ATTRIBUTE } from '../constants';
import { SalesOfferPackageInfo } from './api/describeSalesOfferPackage';

const title = 'Sales Offer Package Description - Fares Data Build Tool';
const description = 'Sales Offer Package Description page of the Fares Data Build Tool';

export interface SalesOfferPackageParams {
    purchaseLocation: string[];
    paymentMethod: string[];
    ticketFormat: string[];
}

interface DescribeSOPProps {
    errors: ErrorInfo[];
}

const DescribeSOP = ({ errors, csrfToken }: DescribeSOPProps & CustomAppProps): ReactElement => {
    const sopNameError = errors.find(error => error.id === 'sop-name');
    const sopDescriptionError = errors.find(error => error.id === 'sop-description');
    return (
        <BaseLayout title={title} description={description} errors={errors}>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <CsrfForm action="/api/describeSalesOfferPackage" method="post" csrfToken={csrfToken}>
                        <>
                            <ErrorSummary errors={errors} />
                            <div className={`govuk-form-group${errors.length > 0 ? ' govuk-form-group--error' : ''}`}>
                                <fieldset className="govuk-fieldset" aria-describedby="page-heading">
                                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                        <h1 className="govuk-fieldset__heading" id="page-heading">
                                            Describe your sales offer package
                                        </h1>
                                    </legend>
                                    <span className="govuk-hint" id="describe-sop-hint">
                                        Enter a name and description for your sales offer package that means something
                                        to you. This will be displayed back to you when you choose from your saved sales
                                        offer packages.
                                    </span>
                                    <div className="govuk-form-group">
                                        <label className="govuk-label" htmlFor="sop-name">
                                            Name
                                        </label>
                                        <FormElementWrapper
                                            errors={errors}
                                            errorId={sopNameError ? sopNameError.id : ''}
                                            errorClass="govuk-input--error"
                                        >
                                            <input
                                                className="govuk-input"
                                                id="sop-name"
                                                name="salesOfferPackageName"
                                                type="text"
                                                defaultValue={sopNameError ? sopNameError.userInput : ''}
                                                aria-describedby={sopNameError ? `${sopNameError.id}-error` : ''}
                                            />
                                        </FormElementWrapper>
                                    </div>
                                    <div className="govuk-form-group">
                                        <label className="govuk-label" htmlFor="sop-description">
                                            Description
                                        </label>
                                        <FormElementWrapper
                                            errors={errors}
                                            errorId={sopDescriptionError ? sopDescriptionError.id : ''}
                                            errorClass="govuk-textarea--error"
                                        >
                                            <textarea
                                                className="govuk-textarea"
                                                id="sop-description"
                                                name="salesOfferPackageDescription"
                                                rows={4}
                                                aria-describedby={
                                                    sopDescriptionError ? `${sopDescriptionError.id}-error` : ''
                                                }
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
};

export const getServerSideProps = (ctx: NextPageContextWithSession): {} => {
    const salesOfferPackageParams: SalesOfferPackageParams | SalesOfferPackageInfo = ctx.req?.session?.[SOP_ATTRIBUTE];

    const errors: ErrorInfo[] = [];
    console.log(typeof salesOfferPackageParams);

    // const errors: ErrorInfo[] = salesOfferPackageParams?.errors || [];

    return { props: { errors } };
};

export default DescribeSOP;
