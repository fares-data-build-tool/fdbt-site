import React, { ReactElement } from 'react';
import { parseCookies } from 'nookies';
import {
    getServiceByNocCodeAndLineName,
    batchGetStopsByAtcoCode,
    Stop,
    RawService,
    RawJourneyPattern,
} from '../data/auroradb';
import { BasicService, CustomAppProps, NextPageContextWithSession } from '../interfaces/index';
import { OPERATOR_COOKIE, SERVICE_ATTRIBUTE, JOURNEY_ATTRIBUTE, MATCHING_ATTRIBUTE } from '../constants';
import { getUserFareStages, UserFareStages } from '../data/s3';
import MatchingBase from '../components/MatchingBase';
import { getNocFromIdToken } from '../utils';
import { getSessionAttribute } from '../utils/sessions';

const title = 'Matching - Fares Data Build Tool';
const description = 'Matching page of the Fares Data Build Tool';
const heading = 'Match stops to fares stages';
const hintText = 'Select a fare stage for each stop.';
const travelineHintText = 'This data has been taken from the Traveline National Dataset and NaPTAN database.';
const apiEndpoint = '/api/matching';

interface MatchingProps {
    userFareStages: UserFareStages;
    stops: Stop[];
    service: BasicService;
    error: boolean;
    selectedFareStages: string[];
}

const Matching = ({
    userFareStages,
    stops,
    service,
    error,
    selectedFareStages,
    csrfToken,
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

// Gets a list of journey pattern sections with a given start and end point
const getJourneysByStartAndEndPoint = (
    service: RawService,
    selectedStartPoint: string,
    selectedEndPoint: string,
): RawJourneyPattern[] =>
    service.journeyPatterns.filter(
        item =>
            item.orderedStopPoints[0].stopPointRef === selectedStartPoint &&
            item.orderedStopPoints.slice(-1)[0].stopPointRef === selectedEndPoint,
    );

// Gets a unique set of stop point refs from an array of journey pattern sections
const getMasterStopList = (journeys: RawJourneyPattern[]): string[] => [
    ...new Set(journeys.flatMap(journey => journey.orderedStopPoints.map(item => item.stopPointRef))),
];

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: MatchingProps }> => {
    const cookies = parseCookies(ctx);
    const operatorCookie = cookies[OPERATOR_COOKIE];
    const serviceObject = getSessionAttribute(ctx.req, SERVICE_ATTRIBUTE);
    const journeyInfo = getSessionAttribute(ctx.req, JOURNEY_ATTRIBUTE);
    const matchingInfo = getSessionAttribute(ctx.req, MATCHING_ATTRIBUTE);
    const nocCode = getNocFromIdToken(ctx);

    if (!operatorCookie || !serviceObject || !journeyInfo || !nocCode) {
        throw new Error('Necessary cookies not found to show matching page');
    }

    const operatorObject = JSON.parse(operatorCookie);
    const lineName = serviceObject.service.split('#')[0];
    const [selectedStartPoint, selectedEndPoint] = journeyInfo.directionJourneyPattern.split('#');
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
            error: !matchingInfo ? false : matchingInfo.error,
            selectedFareStages: !matchingInfo ? [] : matchingInfo.selectedFareStages,
        },
    };
};

export default Matching;
