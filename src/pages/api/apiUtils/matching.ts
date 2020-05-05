import { UserFareStages } from '../../../data/s3';
import { Stop } from '../../../data/auroradb';
import { MatchingFareZones } from '../../../interfaces/matchingInterface';

const getFareZones = (userFareStages: UserFareStages, matchingFareZones: MatchingFareZones) => {
    return userFareStages.fareStages
        .filter(userStage => matchingFareZones[userStage.stageName])
        .map(userStage => {
            const matchedZone = matchingFareZones[userStage.stageName];

            return {
                name: userStage.stageName,
                stops: matchedZone.stops.map((stop: Stop) => ({
                    ...stop,
                    qualifierName: '',
                })),
                prices: userStage.prices,
            };
        });
};

export default getFareZones;
