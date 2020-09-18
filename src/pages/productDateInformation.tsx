import React, { ReactElement } from 'react';
import TwoThirdsLayout from '../layout/Layout';
import CsrfForm from '../components/CsrfForm';
import { CustomAppProps, ErrorInfo, NextPageContextWithSession } from '../interfaces';
import { getSessionAttribute } from '../utils/sessions';
import { PRODUCT_DATE_INFORMATION } from '../constants';
import { isProductDateAttributeWithErrors } from '../interfaces/typeGuards';
import ErrorSummary from '../components/ErrorSummary';
import RadioConditionalInput, { RadioConditionalInputFieldset } from '../components/RadioConditionalInput';
import { getErrorsByIds } from '../utils';
import { ProductDateInformationAttribute } from './api/productDateInformation';

const title = 'Product Date Information - Fares Data Build Tool';
const description = 'Product Date Information page of the Fares Data Build Tool';

export interface FareDateInformationProps {
    errors: ErrorInfo[];
    fieldsets: RadioConditionalInputFieldset[];
    dates: ProductDateInformationAttribute;
}

export const getFieldsets = (errors: ErrorInfo[]): RadioConditionalInputFieldset[] => {
    const productDatesFieldsets: RadioConditionalInputFieldset = {
        heading: {
            id: 'product-dates-information',
            content: 'Is there a start or end date for your product?',
        },
        radios: [
            {
                id: 'product-dates-required',
                name: 'productDates',
                value: 'Yes',
                dataAriaControls: 'product-dates-required-conditional',
                label: 'Yes',
                hint: {
                    id: 'product-dates-required-restriction-hint',
                    content: 'Enter a start and end date',
                },
                inputType: 'date',
                inputs: [
                    {
                        id: 'start-date',
                        name: 'startDate',
                        label: 'Start Date',
                    },
                    {
                        id: 'end-date',
                        name: 'endDate',
                        label: 'End Date',
                    },
                ],
                inputErrors: getErrorsByIds(['start-date', 'end-date'], errors),
            },
            {
                id: 'product-dates-information-not-required',
                name: 'productDates',
                value: 'No',
                label: 'No',
            },
        ],
        radioError: getErrorsByIds(['product-dates-required'], errors),
    };

    return [productDatesFieldsets];
};

const ProductDateInformation = ({
    csrfToken,
    errors = [],
    fieldsets,
    dates = {
        startDateDay: '',
        startDateMonth: '',
        startDateYear: '',
        endDateDay: '',
        endDateMonth: '',
        endDateYear: '',
    },
}: FareDateInformationProps & CustomAppProps): ReactElement => {
    const customErrors: ErrorInfo[] = [];

    const startDateErrors = errors.find(error => error.id === 'start-date');

    if (startDateErrors) {
        customErrors.push({ errorMessage: startDateErrors.errorMessage, id: 'start-date-error' });
    }

    const endDateErrors = errors.find(error => error.id === 'end-date');

    if (endDateErrors) {
        customErrors.push({ errorMessage: endDateErrors.errorMessage, id: 'end-date-error' });
    }

    return (
        <TwoThirdsLayout title={title} description={description}>
            <CsrfForm action="/api/productDateInformation" method="post" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={customErrors} />
                    {fieldsets.map(fieldset => {
                        return <RadioConditionalInput key={fieldset.heading.id} fieldset={fieldset} dates={dates} />;
                    })}

                    <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContextWithSession): {} => {
    const productDateAttribute = getSessionAttribute(ctx.req, PRODUCT_DATE_INFORMATION);

    const errors: ErrorInfo[] =
        productDateAttribute && isProductDateAttributeWithErrors(productDateAttribute)
            ? productDateAttribute.errors
            : [];

    const fieldsets: RadioConditionalInputFieldset[] = getFieldsets(errors);

    return {
        props: {
            errors,
            fieldsets,
            dates:
                productDateAttribute && isProductDateAttributeWithErrors(productDateAttribute)
                    ? productDateAttribute.dates
                    : {
                          startDateDay: '',
                          startDateMonth: '',
                          startDateYear: '',
                          endDateDay: '',
                          endDateMonth: '',
                          endDateYear: '',
                      },
        },
    };
};

export default ProductDateInformation;
