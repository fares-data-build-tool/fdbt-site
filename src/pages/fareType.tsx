import React, { ReactElement } from 'react';
import { v4 as uuidv4 } from 'uuid';
import TwoThirdsLayout from '../layout/Layout';
import { INTERNAL_NOC } from '../constants';
import { FARE_TYPE_ATTRIBUTE, OPERATOR_ATTRIBUTE, TXC_SOURCE_ATTRIBUTE } from '../constants/attributes';
import { ErrorInfo, NextPageContextWithSession, FareTypeRadio } from '../interfaces';
import { isFareTypeAttributeWithErrors } from '../interfaces/typeGuards';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import FareTypeRadios from '../components/FareTypeRadios';
import { getAndValidateNoc, getCsrfToken, isSchemeOperator } from '../utils/index';
import logger from '../utils/logger';
import { getSessionAttribute, updateSessionAttribute } from '../utils/sessions';
import { redirectTo } from './api/apiUtils';
import { getAllServicesByNocCode } from '../data/auroradb';

const title = 'Fare Type - Create Fares Data Service ';
const description = 'Fare Type selection page of the Create Fares Data Service';

const errorId = 'fare-type-single';

interface FareTypeProps {
    operatorName: string;
    schemeOp: boolean;
    displayCarnet: boolean;
    errors: ErrorInfo[];
    csrfToken: string;
}

export const buildUuid = (noc: string): string => {
    const uuid = uuidv4();

    return noc + uuid.substring(0, 8);
};

const buildRadioProps = (schemeOp: boolean, displayCarnet: boolean): FareTypeRadio[] => {
    if (schemeOp) {
        return [
            {
                fareType: 'period',
                label: 'Period ticket',
                hint: 'A zonal ticket valid for a number of days, weeks, months or years',
            },
            {
                fareType: 'flatFare',
                label: 'Flat fare ticket',
                hint: 'A fixed fee ticket for a single journey',
            },
        ];
    }
    const radios = [
        {
            fareType: 'single',
            label: 'Single ticket',
            hint: 'A ticket for a point to point journey',
        },
        {
            fareType: 'return',
            label: 'Return ticket',
            hint: 'An inbound and outbound ticket for the same service',
        },
        {
            fareType: 'flatFare',
            label: 'Flat fare ticket',
            hint: 'A fixed fee ticket for a single journey',
        },
        {
            fareType: 'period',
            label: 'Period ticket',
            hint: 'A ticket valid for a number of days, weeks, months or years',
        },
        {
            fareType: 'multiOperator',
            label: 'Multi-operator',
            hint: 'A ticket that covers more than one operator',
        },
        {
            fareType: 'schoolService',
            label: 'School service',
            hint: 'A ticket available to pupils in full-time education',
        },
    ];

    if (displayCarnet) {
        radios.splice(4, 0, {
            fareType: 'carnet',
            label: 'Carnet ticket',
            hint: 'A bundle of pre-paid tickets',
        });
    }

    return radios;
};

const FareType = ({ operatorName, schemeOp, displayCarnet, errors = [], csrfToken }: FareTypeProps): ReactElement => {
    return (
        <TwoThirdsLayout title={title} description={description} errors={errors}>
            <CsrfForm action="/api/fareType" method="post" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={errors} />
                    <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                        <fieldset className="govuk-fieldset" aria-describedby="fare-type-page-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h1 className="govuk-fieldset__heading" id="fare-type-page-heading">
                                    Select a fare type
                                </h1>
                            </legend>
                            <span className="govuk-hint" id="fare-type-operator-hint">
                                {operatorName}
                            </span>
                            <FormElementWrapper errors={errors} errorId={errorId} errorClass="govuk-radios--error">
                                <FareTypeRadios fares={buildRadioProps(schemeOp, displayCarnet)} />
                            </FormElementWrapper>
                        </fieldset>
                    </div>
                    <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: FareTypeProps }> => {
    const csrfToken = getCsrfToken(ctx);
    const schemeOp = isSchemeOperator(ctx);
    const nocCode = getAndValidateNoc(ctx);
    const services = await getAllServicesByNocCode(nocCode);
    const hasBodsServices = services.some(service => service.dataSource && service.dataSource === 'bods');
    const hasTndsServices = services.some(service => service.dataSource && service.dataSource === 'tnds');

    if (!schemeOp && services.length === 0) {
        if (ctx.res) {
            redirectTo(ctx.res, '/noServices');
        } else {
            throw new Error(`No services found for NOC Code: ${nocCode}`);
        }
    }

    const dataSourceAttribute = getSessionAttribute(ctx.req, TXC_SOURCE_ATTRIBUTE);

    if (!dataSourceAttribute) {
        updateSessionAttribute(ctx.req, TXC_SOURCE_ATTRIBUTE, {
            source: hasBodsServices && !hasTndsServices ? 'bods' : 'tnds',
            hasBods: hasBodsServices,
            hasTnds: hasTndsServices,
        });
    }

    const operatorAttribute = getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE);

    if (!operatorAttribute || !nocCode) {
        throw new Error('Could not extract the necessary operator info for the fareType page.');
    }
    const operatorName = operatorAttribute.name || '';
    const uuid = buildUuid(nocCode);

    updateSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE, {
        ...operatorAttribute,
        uuid,
    });

    if (schemeOp || nocCode !== INTERNAL_NOC) {
        logger.info('', {
            context: 'pages.fareType',
            message: 'transaction start',
        });
    }

    if (schemeOp) {
        updateSessionAttribute(ctx.req, FARE_TYPE_ATTRIBUTE, { fareType: 'multiOperator' });
    }

    const fareTypeAttribute = getSessionAttribute(ctx.req, FARE_TYPE_ATTRIBUTE);

    const errors: ErrorInfo[] =
        fareTypeAttribute && isFareTypeAttributeWithErrors(fareTypeAttribute) ? fareTypeAttribute.errors : [];

    const displayCarnet = process.env.STAGE !== 'prod';

    return { props: { operatorName, schemeOp, displayCarnet, errors, csrfToken } };
};

export default FareType;
