import React, { ReactElement } from 'react';
import { parseCookies } from 'nookies';
import { batchGetStopsByAtcoCode, getServiceByNocCodeAndLineName, Stop } from '../data/auroradb';
import { JOURNEY_COOKIE, MATCHING_ATTRIBUTE, OPERATOR_COOKIE, SERVICE_ATTRIBUTE } from '../constants';
import { getUserFareStages, UserFareStages } from '../data/s3';
import { getJourneysByStartAndEndPoint, getMasterStopList } from '../utils/dataTransform';
import MatchingBase from '../components/MatchingBase';
import { BasicService, CustomAppProps, NextPageContextWithSession } from '../interfaces/index';
import { getAndValidateNoc } from '../utils';
import { getSessionAttribute } from '../utils/sessions';
import { isMatchingWithErrors } from './matching';
import { isService } from './api/apiUtils/typeChecking';

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
    const journeyCookie = cookies[JOURNEY_COOKIE];
    const nocCode = getAndValidateNoc(ctx);

    const serviceAttribute = getSessionAttribute(ctx.req, SERVICE_ATTRIBUTE);

    if (!operatorCookie || !isService(serviceAttribute) || !journeyCookie || !nocCode) {
        throw new Error('Necessary cookies not found to show matching page');
    }

    const operatorObject = JSON.parse(operatorCookie);
    const journeyObject = JSON.parse(journeyCookie);
    const lineName = serviceAttribute.service.split('#')[0];
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

    const matchingAttribute = getSessionAttribute(ctx.req, MATCHING_ATTRIBUTE);

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
            error: matchingAttribute && isMatchingWithErrors(matchingAttribute) ? matchingAttribute.error : false,
            selectedFareStages:
                matchingAttribute && isMatchingWithErrors(matchingAttribute)
                    ? matchingAttribute.selectedFareStages
                    : [],
        },
    };
};

export default OutboundMatching;
