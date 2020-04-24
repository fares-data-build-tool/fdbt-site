import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import flatMap from 'array.prototype.flatmap';
import Layout from '../layout/Layout';
import { OPERATOR_COOKIE, SERVICE_COOKIE, JOURNEY_COOKIE } from '../constants';
import { deleteCookieOnServerSide } from '../utils';
import {
    getServiceByNocCodeAndLineName,
    Service,
    RawService,
    RawJourneyPattern,
    JourneyPattern, batchGetStopsByAtcoCode,
} from '../data/auroradb';
import DirectionDropdown from '../components/DirectionDropdown';
import FormElementWrapper from '../components/FormElementWrapper';
import ErrorSummary from '../components/ErrorSummary';
import { ErrorInfo } from '../types';

const title = 'Journey Selection - Fares data build tool';
const description = 'Inbound and Outbound journey selection page of the Fares data build tool';

export const inboundErrorId = 'inbound-error';
export const outboundErrorId = 'outbound-error';

interface DirectionProps {
    service: Service;
    errors: ErrorInfo[];
    outboundJourney: string;
    inboundJourney: string;
}

const SelectJourneyDirection = ({ service, errors, outboundJourney, inboundJourney  }: DirectionProps): ReactElement => {
    console.log('erros', errors);
    return (
        <Layout title={title} description={description}>
            <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
                <form action="/api/selectJourneyDirection" method="post">
                    <ErrorSummary errors={errors} />
                    <div className="govuk-form-group">
                        <fieldset className="govuk-fieldset" aria-describedby="page-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                <h1 className="govuk-fieldset__heading" id="page-heading">
                                    Please select your journey direction
                                </h1>
                            </legend>
                            <div className="govuk-!-margin-top-5">
                                <FormElementWrapper
                                    errors={errors}
                                    errorId={outboundErrorId}
                                    errorClass="govuk-radios--error"
                                >
                                    <div>
                                        <span className="govuk-hint" id="journey-selection-hint">
                                            Outbound Journey
                                        </span>
                                        <DirectionDropdown
                                            journeyPatterns={service.journeyPatterns}
                                            selectNameID="outboundJourney"
                                            outboundJourney={outboundJourney}
                                        />
                                    </div>
                                </FormElementWrapper>
                            </div>
                            <div className="govuk-!-margin-top-6">
                                <FormElementWrapper
                                    errors={errors}
                                    errorId={inboundErrorId}
                                    errorClass="govuk-radios--error"
                                >
                                    <div>
                                        <span className="govuk-hint" id="journey-selection-hint">
                                            Inbound Journey
                                        </span>
                                        <DirectionDropdown
                                            journeyPatterns={service.journeyPatterns}
                                            selectNameID="inboundJourney"
                                            inboundJourney={inboundJourney}
                                        />
                                    </div>
                                </FormElementWrapper>
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
};

const enrichJourneyPatternsWithNaptanInfo = async (journeyPatterns: RawJourneyPattern[]): Promise<JourneyPattern[]> =>
    Promise.all(
        journeyPatterns.map(
            async (item: RawJourneyPattern): Promise<JourneyPattern> => {
                const stopList = flatMap(item.JourneyPattern, stop => {
                    return stop.OrderedStopPoints.map(stopPoint => stopPoint.StopPointRef);
                });

                const startPoint = item.JourneyPattern[0].OrderedStopPoints[0];
                const [startPointStopLocality] = await batchGetStopsByAtcoCode([startPoint.StopPointRef]);

                const endPoint = item.JourneyPattern.slice(-1)[0].OrderedStopPoints.slice(-1)[0];
                const [endPointStopLocality] = await batchGetStopsByAtcoCode([endPoint.StopPointRef]);

                return {
                    startPoint: {
                        Display: `${startPoint.CommonName}${
                            startPointStopLocality?.localityName ? `, ${startPointStopLocality.localityName}` : ''
                        }`,
                        Id: startPoint.StopPointRef,
                    },
                    endPoint: {
                        Display: `${endPoint.CommonName}${
                            endPointStopLocality?.localityName ? `, ${endPointStopLocality.localityName}` : ''
                        }`,
                        Id: endPoint.StopPointRef,
                    },
                    stopList,
                };
            },
        ),
    );

export const getServerSideProps = async (ctx: NextPageContext): Promise<{}> => {
    deleteCookieOnServerSide(ctx, JOURNEY_COOKIE);
    const cookies = parseCookies(ctx);
    const operatorCookie = cookies[OPERATOR_COOKIE];
    const serviceCookie = cookies[SERVICE_COOKIE];
    const journeyCookie = cookies[JOURNEY_COOKIE];

    if (!operatorCookie || !serviceCookie) {
        throw new Error('Necessary cookies not found to show direction page');
    }

    const operatorInfo = JSON.parse(operatorCookie);
    const serviceInfo = JSON.parse(serviceCookie);

    const lineName = serviceInfo.service.split('#')[0];

    const rawService: RawService = await getServiceByNocCodeAndLineName(operatorInfo.nocCode, lineName);
    const service: Service = {
        ...rawService,
        journeyPatterns: await enrichJourneyPatternsWithNaptanInfo(rawService.journeyPatterns),
    };

    if (!service) {
        throw new Error(
            `No service info could be retrieved for nocCode: ${operatorInfo.nocCode} and lineName: ${lineName}`,
        );
    }

    // Remove journeys with duplicate start and end points for display purposes
    service.journeyPatterns = service.journeyPatterns.filter(
        (pattern, index, self) =>
            self.findIndex(
                item => item.endPoint.Id === pattern.endPoint.Id && item.startPoint.Id === pattern.startPoint.Id,
            ) === index,
    );

    if (journeyCookie) {
        const journeyCookieInfo = JSON.parse(journeyCookie);
        if (journeyCookieInfo.errorMessages.length > 0) {
            const { outboundJourney = '',  inboundJourney = '' } = journeyCookieInfo;
            return {
                props: {
                    service,
                    errors: journeyCookieInfo.errorMessages,
                    outboundJourney,
                    inboundJourney
                },
            };
        }
    }

    return { props: { service, errors: [] } };
};

export default SelectJourneyDirection;
