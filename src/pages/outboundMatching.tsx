import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import Layout from '../layout/Layout';
import {
    getServiceByNocCodeAndLineName,
    batchGetStopsByAtcoCode,
    Stop,
} from '../data/auroradb';
import { OPERATOR_COOKIE, SERVICE_COOKIE, JOURNEY_COOKIE, MATCHING_COOKIE } from '../constants';
import { getUserFareStages, UserFareStages } from '../data/s3';
import MatchingList from '../components/MatchingList';
import { getJourneysByStartAndEndPoint, getMasterStopList } from '../utils/dataTransform';

const title = 'Outbound Matching - Fares data build tool';
const description = 'Outbound Matching page of the fares data build tool';

export interface BasicService {
    lineName: string;
    nocCode: string;
    operatorShortName: string;
}

interface MatchingProps {
    userFareStages: UserFareStages;
    stops: Stop[];
    service: BasicService;
    error: boolean;
}

const OutboundMatching = ({ userFareStages, stops, service, error }: MatchingProps): ReactElement => (
    <Layout title={title} description={description}>
        <main className="govuk-main-wrapper app-main-class matching-page" id="main-content" role="main">
            <form action="/api/outboundMatching" method="post">
                <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                        <h1 className="govuk-fieldset__heading">Outbound: Match stops to fare stages</h1>
                    </legend>
                    <span id="dropdown-error" className="govuk-error-message">
                        <span className={error ? '' : 'govuk-visually-hidden'}>
                            Ensure each fare stage is assigned at least once.
                        </span>
                    </span>
                    <span className="govuk-hint" id="match-fares-hint">
                        Select the correct fare stage for each stop on the Outbound Journey.
                    </span>
                    <MatchingList userFareStages={userFareStages} stops={stops} />
                </div>

                <input type="hidden" name="service" value={JSON.stringify(service)} />
                <input type="hidden" name="userfarestages" value={JSON.stringify(userFareStages)} />
                <input type="submit" value="Submit" id="submit-button" className="govuk-button govuk-button--start" />
            </form>
        </main>
    </Layout>
);

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: MatchingProps }> => {
    const cookies = parseCookies(ctx);
    const operatorCookie = cookies[OPERATOR_COOKIE];
    const serviceCookie = cookies[SERVICE_COOKIE];
    const journeyCookie = cookies[JOURNEY_COOKIE];
    const matchingCookie = cookies[MATCHING_COOKIE];

    if (!operatorCookie || !serviceCookie || !journeyCookie) {
        throw new Error('Necessary cookies not found to show matching page');
    }

    const operatorObject = JSON.parse(operatorCookie);
    const serviceObject = JSON.parse(serviceCookie);
    const journeyObject = JSON.parse(journeyCookie);
    const lineName = serviceObject.service.split('#')[0];
    const { nocCode } = operatorObject;
    const [selectedStartPoint, selectedEndPoint] = journeyObject.outboundJourney.split('#');
    const service = await getServiceByNocCodeAndLineName(operatorObject.nocCode, lineName);
    const userFareStages = await getUserFareStages(operatorObject.uuid);
    const relevantJourneys = getJourneysByStartAndEndPoint(service, selectedStartPoint, selectedEndPoint);
    const masterStopList = getMasterStopList(relevantJourneys);

    if (masterStopList.length === 0) {
        throw new Error(
            `No stops found for journey: nocCode ${nocCode}, lineName: ${lineName}, startPoint: ${selectedStartPoint}, endPoint: ${selectedEndPoint}`,
        );
    }

    const naptanInfo = await batchGetStopsByAtcoCode(masterStopList);
    const orderedStops = masterStopList
        .map(atco => naptanInfo.find(s => s.atcoCode === atco))
        .filter((stop: Stop | undefined): stop is Stop => stop !== undefined);

    return {
        props: {
            stops: orderedStops,
            userFareStages,
            service: {
                lineName,
                nocCode,
                operatorShortName: service.operatorShortName,
            },
            error: !matchingCookie ? false : JSON.parse(matchingCookie).error,
        },
    };
};

export default OutboundMatching;
