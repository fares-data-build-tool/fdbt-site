import flatMap from 'array.prototype.flatmap';
import { batchGetStopsByAtcoCode, JourneyPattern, RawJourneyPattern } from '../data/auroradb';

// eslint-disable-next-line import/prefer-default-export
export const enrichJourneyPatternsWithNaptanInfo = async (
    journeyPatterns: RawJourneyPattern[],
): Promise<JourneyPattern[]> =>
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
