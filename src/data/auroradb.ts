import dateFormat from 'dateformat';
import { createPool, Pool } from 'mysql2/promise';
import awsParamStore from 'aws-param-store';

export interface ServiceType {
    lineName: string;
    startDate: string;
    description: string;
}

export interface JourneyPattern {
    startPoint: {
        Id: string;
        Display: string;
    };
    endPoint: {
        Id: string;
        Display: string;
    };
    stopList: string[];
}

export interface QueryData {
    operatorShortName: string;
    serviceDescription: string;
    lineName: string;
    fromAtcoCode: string;
    toAtcoCode: string;
    fromCommonName: string;
    toCommonName: string;
    journeyPatternId: string;
    order: string;
}
export interface RawJourneyPatternStops {
    OrderedStopPoints: {
        StopPointRef: string;
        CommonName: string;
    }[];
}

export interface RawJourneyPattern {
    JourneyPattern: RawJourneyPatternStops[];
}

interface NaptanInfo {
    commonName: string;
    naptanCode: string;
    atcoCode: string;
    nptgLocalityCode: string;
    localityName: string;
    parentLocalityName: string;
    indicator: string;
    street: string;
}

interface NaptanAtcoCodes {
    naptanCode: string;
    atcoCode: string;
}

export interface Stop {
    stopName: string;
    naptanCode: string;
    atcoCode: string;
    localityCode: string;
    localityName: string;
    parentLocalityName: string;
    indicator?: string;
    street?: string;
    qualifierName?: string;
}

export interface StopIdentifiers {
    naptanCode: string | null;
    atcoCode: string;
}

export interface Service {
    serviceDescription: string;
    operatorShortName: string;
    journeyPatterns: JourneyPattern[];
}

export interface RawService {
    serviceDescription: string;
    operatorShortName: string;
    journeyPatterns: RawJourneyPattern[];
}

export const getAuroraDBClient = (): Pool => {
    let client: Pool;

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        client = createPool({
            host: 'localhost',
            user: 'fdbt_site',
            password: 'password',
            database: 'fdbt',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
    } else {
        client = createPool({
            host: process.env.RDS_HOST,
            user: awsParamStore.getParameterSync('fdbt-rds-site-username', { region: 'eu-west-2' }).Value,
            password: awsParamStore.getParameterSync('fdbt-rds-site-password', { region: 'eu-west-2' }).Value,
            database: 'fdbt',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
    }

    return client;
};

export const convertDateFormat = (startDate: string): string => {
    return dateFormat(startDate, 'dd/mm/yyyy');
};

let connectionPool: Pool;

const executeQuery = async <T>(query: string, values: string[]): Promise<T> => {
    if (!connectionPool) {
        connectionPool = getAuroraDBClient();
    }
    const [rows] = await connectionPool.execute(query, values);
    return JSON.parse(JSON.stringify(rows));
};

export const getServicesByNocCode = async (nocCode: string): Promise<ServiceType[]> => {
    try {
        const queryInput = 'SELECT * FROM `tndsService` WHERE `nocCode` = ?';

        const queryResult = await executeQuery<ServiceType[]>(queryInput, [nocCode]);

        return (
            queryResult.map(item => ({
                lineName: item.lineName,
                startDate: convertDateFormat(item.startDate),
                description: item.description,
            })) || []
        );
    } catch (error) {
        throw new Error(`Could not retrieve services from AuroraDB: ${error.stack}`);
    }
};

export const batchGetStopsByAtcoCode = async (atcoCodes: string[]): Promise<Stop[] | []> => {
    try {
        const substitution = atcoCodes.map(() => '?').join(',');
        const batchQuery = `SELECT * FROM naptanStop WHERE atcoCode IN (${substitution})`;

        const queryResults = await executeQuery<NaptanInfo[]>(batchQuery, atcoCodes);

        return queryResults.map(item => ({
            stopName: item.commonName,
            naptanCode: item.naptanCode,
            atcoCode: item.atcoCode,
            localityCode: item.nptgLocalityCode,
            localityName: item.localityName,
            parentLocalityName: item.parentLocalityName !== null ? item.parentLocalityName : '',
            indicator: item.indicator,
            street: item.street,
        }));
    } catch (error) {
        throw new Error(
            `Error performing batch get for naptan info for stop list '${JSON.stringify(atcoCodes)}': ${error.stack}`,
        );
    }
};

export const getAtcoCodesByNaptanCodes = async (naptanCodes: string[]): Promise<NaptanAtcoCodes[]> => {
    const substitution = naptanCodes.map(() => '?').join(',');
    const atcoCodesByNaptanCodeQuery = `SELECT * FROM naptanStop WHERE naptanCode IN (${substitution})`;

    try {
        const queryResults = await executeQuery<NaptanAtcoCodes[]>(atcoCodesByNaptanCodeQuery, naptanCodes);
        return queryResults.map(item => ({ atcoCode: item.atcoCode, naptanCode: item.naptanCode }));
    } catch (error) {
        throw new Error(
            `Error performing queries for ATCO Codes using Naptan Codes '${JSON.stringify(naptanCodes)}': ${
                error.stack
            }`,
        );
    }
};

export const getServiceByNocCodeAndLineName = async (nocCode: string, lineName: string): Promise<RawService> => {
    const serviceQuery =
        'SELECT os.operatorShortName, os.serviceDescription, os.lineName, pl.fromAtcoCode, pl.toAtcoCode, pl.journeyPatternId, pl.orderInSequence, nsStart.commonName AS fromCommonName, nsStop.commonName as toCommonName ' +
        ' FROM tndsOperatorService AS os' +
        ' INNER JOIN tndsJourneyPattern AS ps ON ps.operatorServiceId = os.id' +
        ' INNER JOIN tndsJourneyPatternLink AS pl ON pl.journeyPatternId = ps.id' +
        ' LEFT JOIN naptanStop nsStart ON nsStart.atcoCode=pl.fromAtcoCode' +
        ' LEFT JOIN naptanStop nsStop ON nsStop.atcoCode=pl.toAtcoCode' +
        ' WHERE os.nocCode = ? AND os.lineName = ?' +
        ' ORDER BY pl.orderInSequence, pl.journeyPatternId ASC';

    let queryResult: QueryData[];

    try {
        queryResult = await executeQuery(serviceQuery, [nocCode, lineName]);
    } catch (error) {
        throw new Error(`Could not get journey patterns from Aurora DB: ${error.stack}`);
    }

    const service = queryResult[0];
    const rawPatternService: RawJourneyPattern[] = [];

    // allows to get the unique journey's for the operator e.g. [1,2,3]
    const uniqueJourneyPatterns = queryResult
        .map(item => item.journeyPatternId)
        .filter((value, index, self) => self.indexOf(value) === index);

    uniqueJourneyPatterns.forEach(journey => {
        const filteredJourney = queryResult.filter(item => {
            return item.journeyPatternId === journey;
        });

        const journeyPatternSection: RawJourneyPatternStops = {
            OrderedStopPoints: [
                {
                    StopPointRef: filteredJourney[0].fromAtcoCode,
                    CommonName: filteredJourney[0].fromCommonName,
                },
                ...filteredJourney.map((data: QueryData) => ({
                    StopPointRef: data.toAtcoCode,
                    CommonName: data.toCommonName,
                })),
            ],
        };

        const rawPatternSection: RawJourneyPatternStops[] = [];
        rawPatternSection.push(journeyPatternSection);

        rawPatternService.push({ JourneyPattern: rawPatternSection });
    });

    if (!service || rawPatternService.length === 0) {
        throw new Error(`No journey patterns found for nocCode: ${nocCode}, lineName: ${lineName}`);
    }

    return {
        serviceDescription: service.serviceDescription,
        operatorShortName: service.operatorShortName,
        journeyPatterns: rawPatternService,
    };
};