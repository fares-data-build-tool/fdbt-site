import { Stop } from '../data/auroradb';

export interface MatchingFareZones {
    [key: string]: {
        name: string;
        stops: Stop[];
    };
}
