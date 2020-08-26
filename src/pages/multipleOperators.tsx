import React, { ReactElement } from 'react';
import { getNocFromIdToken } from '../utils';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import { CustomAppProps, ErrorInfo, NextPageContextWithSession } from '../interfaces';
import TwoThirdsLayout from '../layout/Layout';
import FormElementWrapper from '../components/FormElementWrapper';

const title = 'Multiple Operators - Fares Data Build Tool';
const description = 'Multiple Operators page of the Fares Data Build Tool';

type MultipleOperatorsProps = {
    errors?: ErrorInfo[];
    operatorsAndNocs: string[];
};

const MultipleOperators = ({
    operatorsAndNocs,
    errors = [],
    csrfToken,
}: MultipleOperatorsProps & CustomAppProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} errors={errors}>
        <CsrfForm action="/api/passengerType" method="post" csrfToken={csrfToken}>
            <>
                <ErrorSummary errors={errors} />
                <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                    <fieldset className="govuk-fieldset" aria-describedby="service-page-heading">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                            <h1 className="govuk-fieldset__heading" id="service-page-heading">
                                Select an operator and NOC code
                            </h1>
                        </legend>
                        <label className="govuk-visually-hidden" htmlFor="operators">
                            Operator and NOC code list
                        </label>
                        <FormElementWrapper errors={errors} errorId="operator-error" errorClass="govuk-select--error">
                            <select className="govuk-select" id="operators" name="operators" defaultValue="">
                                <option value="" disabled>
                                    Select One
                                </option>
                                {operatorsAndNocs.map((operatorsAndNoc: string) => (
                                    <option
                                        key={`${operatorsAndNoc}`}
                                        value={`${operatorsAndNoc}`}
                                        className="service-option"
                                    >
                                        {operatorsAndNoc}
                                    </option>
                                ))}
                            </select>
                        </FormElementWrapper>
                        <span className="govuk-hint hint-text" id="traveline-hint">
                            This data is taken from the Traveline National Dataset
                        </span>
                    </fieldset>
                </div>
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: MultipleOperatorsProps } => {
    const dataBaseNoc = getNocFromIdToken(ctx);
    let splitNocs: string[] = [];
    if (dataBaseNoc) {
        splitNocs = dataBaseNoc.split('|');
    }
    return { props: { operatorsAndNocs: splitNocs } };
};

export default MultipleOperators;
