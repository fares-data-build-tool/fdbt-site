import dateFormat from 'dateformat';
import { createConnection } from 'mysql2/promise';

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
export interface RawJourneyPatternSection {
    OrderedStopPoints: {
        StopPointRef: string;
        CommonName: string;
    }[];
}

export interface RawJourneyPattern {
    JourneyPatternSections: RawJourneyPatternSection[];
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
        client = createConnection({
            host: 'mysql',
            user: 'fdbt_site',
            password: 'password',
            database: 'fdbt',
        });
    } else {
        // TODO find replacement here
        client = createConnection({
            host: 'mysql',
            user: 'fdbt_site',
            password: 'password',
            database: 'fdbt',
        });
    }

    return client;
};

export const convertDateFormat = (startDate: string): string => {
    return dateFormat(startDate, 'dd/mm/yyyy');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const executeQuery = async (query: string, values: any[]) => {
    const connection = await getAuroraDBClient();
    const [rows] = await connection.execute(query, values);
    connection.end();
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
        throw new Error(`Could not retrieve services from DynamoDB: ${err.name}, ${err.message}`);
    }
};

export const batchGetStopsByAtcoCode = async (atcoCodes: string[]): Promise<Stop[] | []> => {
    let orQuery = '';

    try {
        atcoCodes.forEach((code, index) => {
            orQuery += `atcoCode = ${code} ${index < atcoCodes.length - 1 ? 'OR ' : ''}`;
        });

        const batchQuery = `Select * from naptanStop where ${orQuery}`;

        const results = await executeQuery(batchQuery, []);

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
    const atcoCodesByNaptanCodeQuery = `Select * from naptanStop where naptanCode in ?`;

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
        'SELECT os.operatorShortName, os.serviceDescription, os.lineName, pl.fromAtcoCode, pl.toAtcoCode, pl.journeyPatternSectionId, pl.order, nsStart.commonName AS fromCommonName, nsStop.commonName as toCommonName ' +
        ' FROM tndsOperatorService AS os' +
        ' INNER JOIN tndsJourneyPatternSection AS ps ON ps.operatorServiceId = os.id' +
        ' INNER JOIN tndsJourneyPatternLink AS pl ON pl.journeyPatternSectionId = ps.id' +
        ' LEFT JOIN naptanStop nsStart ON nsStart.atcoCode=pl.fromAtcoCode' +
        ' LEFT JOIN naptanStop nsStop ON nsStop.atcoCode=pl.toAtcoCode' +
        ' WHERE os.nocCode = ? AND os.lineName = ?' +
        ' ORDER BY pl.order, pl.journeyPatternSectionId ASC';

    let queryItems: QueryData[];

    try {
        const queryResult = await executeQuery(serviceQuery, [nocCode, lineName]);
        queryItems = JSON.parse(JSON.stringify(queryResult));
    } catch (err) {
        throw new Error(`Could not get journey patterns from Dynamo DB: ${err.name}, ${err.message}`);
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

        const journeyPatternSection: RawJourneyPatternSection = {
            OrderedStopPoints: filteredJourney.map((data: QueryData) => {
                return {
                    StopPointRef: data.toAtcoCode,
                    CommonName: data.toCommonName,
                };
            }),
        };

        const rawPatternSection: RawJourneyPatternSection[] = [];
        rawPatternSection.push(journeyPatternSection);

        rawPatternService.push({ JourneyPatternSections: rawPatternSection });
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
