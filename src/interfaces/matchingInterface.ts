import { Stop } from '../data/auroradb';

export interface Price {
    price: string;
    fareZones: string[];
}

export interface MatchingFareZones {
    [key: string]: {
        name: string;
        stops: Stop[];
        prices: Price[];
    };
}
