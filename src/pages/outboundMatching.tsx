import React, { ReactElement } from 'react';
import { parseCookies } from 'nookies';
import { getServiceByNocCodeAndLineName, batchGetStopsByAtcoCode, Stop } from '../data/auroradb';
import { OPERATOR_COOKIE, SERVICE_ATTRIBUTE, JOURNEY_ATTRIBUTE, MATCHING_ATTRIBUTE } from '../constants';
import { getUserFareStages, UserFareStages } from '../data/s3';
import { getJourneysByStartAndEndPoint, getMasterStopList } from '../utils/dataTransform';
import MatchingBase from '../components/MatchingBase';
import { BasicService, CustomAppProps, NextPageContextWithSession } from '../interfaces/index';
import { getNocFromIdToken } from '../utils';
import { getSessionAttribute } from '../utils/sessions';

const heading = 'Outbound - Match stops to fare stages';
const title = 'Outbound Matching - Fares Data Build Tool';
const description = 'Outbound Matching page of the Fares Data Build Tool';
const hintText = 'Select a fare stage for each stop on the outbound journey.';
const travelineHintText = 'This data has been taken from the Traveline National Dataset and NaPTAN database.';
const apiEndpoint = '/api/outboundMatching';

interface MatchingProps {
    userFareStages: UserFareStages;
    stops: Stop[];
    service: BasicService;
    error: boolean;
    selectedFareStages: string[];
}

const OutboundMatching = ({
    userFareStages,
    stops,
    service,
    error,
    csrfToken,
    selectedFareStages,
}: MatchingProps & CustomAppProps): ReactElement => (
    <MatchingBase
        userFareStages={userFareStages}
        stops={stops}
        service={service}
        error={error}
        selectedFareStages={selectedFareStages}
        heading={heading}
        title={title}
        description={description}
        hintText={hintText}
        travelineHintText={travelineHintText}
        apiEndpoint={apiEndpoint}
        csrfToken={csrfToken}
    />
);

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: MatchingProps }> => {
    const cookies = parseCookies(ctx);
    const operatorCookie = cookies[OPERATOR_COOKIE];
    const serviceObject = getSessionAttribute(ctx.req, SERVICE_ATTRIBUTE);
    const journeyCookie = cookies[JOURNEY_ATTRIBUTE];
    const matchingCookie = cookies[MATCHING_ATTRIBUTE];
    const nocCode = getNocFromIdToken(ctx);

    if (!operatorCookie || !serviceObject || !journeyCookie || !nocCode) {
        throw new Error('Necessary cookies not found to show matching page');
    }

    const operatorObject = JSON.parse(operatorCookie);
    const journeyObject = JSON.parse(journeyCookie);
    const lineName = serviceObject.service.split('#')[0];
    const [selectedStartPoint, selectedEndPoint] = journeyObject.outboundJourney.split('#');
    const service = await getServiceByNocCodeAndLineName(nocCode, lineName);
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

    const parsedMatchingCookie = !matchingCookie ? false : JSON.parse(matchingCookie);

    return {
        props: {
            stops: orderedStops,
            userFareStages,
            service: {
                lineName,
                nocCode,
                operatorShortName: service.operatorShortName,
                serviceDescription: service.serviceDescription,
            },
            error: !parsedMatchingCookie.outbound ? false : JSON.parse(matchingCookie).outbound.error,
            selectedFareStages: !parsedMatchingCookie.outbound
                ? []
                : JSON.parse(matchingCookie).outbound.selectedFareStages,
        },
    };
};

export default OutboundMatching;
