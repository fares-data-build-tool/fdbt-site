import AWS from 'aws-sdk';
import dateFormat from 'dateformat';
import { createPool } from 'mysql2/promise';

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
    journeyPatternSectionId: string;
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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getAuroraDBClient = () => {
    let client = null;

    if (process.env.NODE_ENV === 'development') {
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
        const ssm = new AWS.SSM();
        client = createPool({
            host: process.env.RDS_HOST,
            user: ssm.getParameter({ Name: 'fdbt-rds-site-username', WithDecryption: true }).toString(),
            password: ssm.getParameter({ Name: 'fdbt-rds-site-password', WithDecryption: true }).toString(),
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

const connection = getAuroraDBClient();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const executeQuery = async (query: string, values: any[]) => {
    const [rows] = await connection.execute(query, values);
    return rows;
};

export const getServicesByNocCode = async (nocCode: string): Promise<ServiceType[]> => {
    try {
        const queryInput = 'SELECT * FROM `tndsService` WHERE `nocCode` = ?';

        const queryResult = await executeQuery(queryInput, [nocCode]);

        const resultRow = JSON.parse(JSON.stringify(queryResult));

        return (
            resultRow?.map((item: ServiceType) => ({
                lineName: item.lineName,
                startDate: convertDateFormat(item.startDate),
                description: item.description,
            })) || []
        );
    } catch (err) {
        throw new Error(`Could not retrieve services from AuroraDB: ${err.name}, ${err.message}`);
    }
};

export const batchGetStopsByAtcoCode = async (atcoCodes: string[]): Promise<Stop[] | []> => {
    try {
        const substitution = atcoCodes.map(() => '?').join(',');
        const batchQuery = `SELECT * FROM naptanStop WHERE atcoCode IN (${substitution})`;

        const results = await executeQuery(batchQuery, atcoCodes);

        const parsedResults = JSON.parse(JSON.stringify(results));

        return parsedResults.map((item: NaptanInfo) => ({
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
        console.error(`Error performing batch get for naptan info for stop list: ${atcoCodes}, error: ${error}`);
        throw new Error(error);
    }
};

export const getAtcoCodesByNaptanCodes = async (naptanCodes: string[]): Promise<NaptanAtcoCodes[]> => {
    const listOfNaptanCodes = naptanCodes.toString();
    const atcoCodesByNaptanCodeQuery = `SELECT * FROM naptanStop WHERE naptanCode IN ?`;

    try {
        const results = await executeQuery(atcoCodesByNaptanCodeQuery, [listOfNaptanCodes]);

        const queryResults = JSON.parse(JSON.stringify(results));
        return queryResults.map((item: any) => ({ atcoCode: item.atcoCode, naptanCode: item.NaptanCode }));
    } catch (error) {
        console.error(
            `Error performing queries for ATCO Codes using Naptan Codes: ${naptanCodes}. Error: ${error.stack}`,
        );
        throw new Error(error);
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

    let queryItems: QueryData[];

    try {
        const queryResult = await executeQuery(serviceQuery, [nocCode, lineName]);
        queryItems = JSON.parse(JSON.stringify(queryResult));
    } catch (err) {
        throw new Error(`Could not get journey patterns from Aurora DB: ${err.name}, ${err.message}`);
    }

    const service = queryItems?.[0];
    const rawPatternService: RawJourneyPattern[] = [];

    // allows to get the unique journey's for the operator e.g. [1,2,3]
    const uniqueJourneyPatterns = queryItems
        .map(item => item.journeyPatternSectionId)
        .filter((value, index, self) => self.indexOf(value) === index);

    uniqueJourneyPatterns.forEach(journey => {
        const filteredJourney = queryItems.filter(item => {
            return item.journeyPatternSectionId === journey;
        });

        const journeyPatternSection: RawJourneyPatternStops = {
            OrderedStopPoints: filteredJourney.map((data: QueryData) => {
                return {
                    StopPointRef: data.toAtcoCode,
                    CommonName: data.toCommonName,
                };
            }),
        };

        const rawPatternSection: RawJourneyPatternStops[] = [];
        rawPatternSection.push(journeyPatternSection);

        console.log('pattersion', rawPatternSection);
        rawPatternService.push({ JourneyPattern: rawPatternSection });
    });

    console.log('raw patter', rawPatternService);

    if (!service || rawPatternService.length === 0) {
        throw new Error(`No journey patterns found for nocCode: ${nocCode}, lineName: ${lineName}`);
    }

    return {
        serviceDescription: service.serviceDescription,
        operatorShortName: service.operatorShortName,
        journeyPatterns: rawPatternService,
    };
};
