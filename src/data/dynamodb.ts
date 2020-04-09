import AWS from 'aws-sdk';
import dateFormat from 'dateformat';
import flatMap from 'array.prototype.flatmap';
import { createConnection } from 'mysql2/promise';
import { NAPTAN_TABLE_NAME, SERVICES_TABLE_NAME, TNDS_TABLE_NAME, NAPTAN_TABLE_GSI } from '../constants';

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
    Id: string;
    OrderedStopPoints: {
        StopPointRef: string;
        CommonName: string;
    }[];
    StartPoint: string;
    EndPoint: string;
}

export interface RawJourneyPattern {
    JourneyPatternSections: RawJourneyPatternSection[];
}

interface DynamoNaptanInfo {
    CommonName: string;
    NaptanCode: string;
    ATCOCode: string;
    NptgLocalityCode: string;
    LocalityName: string;
    ParentLocalityName: string;
    Indicator: string;
    Street: string;
}

interface DynamoNaptanIndex {
    naptanCode: string;
    atcoCode: string;
}

interface RawDynamoNaptanIndex {
    NaptanCode: string;
    Partition: string;
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

const getDynamoDBClient = (): AWS.DynamoDB.DocumentClient => {
    const dynamoDbRegion = process.env.AWS_REGION || 'eu-west-2';

    const options = {
        convertEmptyValues: true,
        region: dynamoDbRegion,
    };

    let client = null;

    if (process.env.NODE_ENV === 'development') {
        client = new AWS.DynamoDB.DocumentClient({
            ...options,
            endpoint: 'http://localhost:9100',
        });
    } else {
        client = new AWS.DynamoDB.DocumentClient(options);
    }

    return client;
};

const dynamoDbClient = getDynamoDBClient();

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

const executeQuery = async (query: string) => {
    const connection = await getAuroraDBClient();
    const [rows] = await connection.execute(query, []);
    connection.end();
    return rows;
};

export const getServicesByNocCode = async (nocCode: string): Promise<ServiceType[]> => {
    try {
        const tableName = process.env.NODE_ENV === 'development' ? 'tndsService' : SERVICES_TABLE_NAME;

        const queryInput = `Select * from ${tableName} where nocCode = "IWCB"`;

        const queryResult = await executeQuery(queryInput);

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
    const tableName = process.env.NODE_ENV === 'development' ? 'naptanStop' : NAPTAN_TABLE_NAME;
    const count = atcoCodes.length;
    const batchSize = 100;
    const batchArray = [];

    for (let i = 0; i < count; i += batchSize) {
        batchArray.push(atcoCodes.slice(i, i + batchSize));
    }

    const batchPromises = batchArray.map(batch => {
        const batchQuery = `Select * from ${tableName} where atcoCode = ${batch}`;

        return executeQuery(batchQuery);
    });

    try {
        const results = await Promise.all(batchPromises);
        const filteredResults = results.filter(item => item.Responses?.[tableName]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const naptanItems: DynamoNaptanInfo[] = flatMap(filteredResults, (item: any) => item.Responses[tableName]);

        return naptanItems.map(item => ({
            stopName: item.CommonName,
            naptanCode: item.NaptanCode,
            atcoCode: item.ATCOCode,
            localityCode: item.NptgLocalityCode,
            localityName: item.LocalityName,
            parentLocalityName: item.ParentLocalityName !== null ? item.ParentLocalityName : '',
            indicator: item.Indicator,
            street: item.Street,
        }));
    } catch (error) {
        console.error(`Error performing batch get for naptan info for stop list: ${atcoCodes}, error: ${error}`);
        throw new Error(error);
    }
};

export const getAtcoCodesByNaptanCodes = async (naptanCodes: string[]): Promise<DynamoNaptanIndex[]> => {
    const tableName = process.env.NODE_ENV === 'development' ? 'dev-Stops' : NAPTAN_TABLE_NAME;
    const indexName = process.env.NODE_ENV === 'development' ? 'NaptanIndex' : NAPTAN_TABLE_GSI;

    const queryPromises = naptanCodes.map(async naptanCode => {
        const queryInput: AWS.DynamoDB.DocumentClient.QueryInput = {
            TableName: tableName,
            IndexName: indexName,
            KeyConditionExpression: 'NaptanCode = :v_code',
            ExpressionAttributeValues: {
                ':v_code': naptanCode,
            },
        };
        return dynamoDbClient.query(queryInput).promise();
    });
    try {
        const results = await Promise.all(queryPromises);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const atcoItems: RawDynamoNaptanIndex[] = flatMap(results, (item: any) => item.Items);
        return atcoItems.map(item => ({ atcoCode: item.Partition, naptanCode: item.NaptanCode }));
    } catch (error) {
        console.error(
            `Error performing queries for ATCO Codes using Naptan Codes: ${naptanCodes}. Error: ${error.stack}`,
        );
        throw new Error(error);
    }
};

export const getServiceByNocCodeAndLineName = async (nocCode: string, lineName: string): Promise<RawService> => {
    const tableName = process.env.NODE_ENV === 'development' ? 'tndsOperatorService' : TNDS_TABLE_NAME;
    const nocCodeDummy='IWCB'; //remove
    const lineNameDummy = '200';

    const serviceQuery = `select os.operatorShortName, os.serviceDescription, os.lineName, pl.fromAtcoCode, pl.toAtcoCode, pl.journeyPatternSectionId, pl.order, nsStart.commonName as fromCommonName, nsStop.commonName as toCommonName 
                          from tndsOperatorService as os   
                          inner join tndsJourneyPatternSection as ps on ps.operatorServiceId = os.id
                          inner join tndsJourneyPatternLink as pl on pl.journeyPatternSectionId = ps.id
                          LEFT JOIN naptanStop nsStart ON nsStart.atcoCode=pl.fromAtcoCode
                          LEFT JOIN naptanStop nsStop ON nsStop.atcoCode=pl.toAtcoCode
                          where os.nocCode = "${nocCodeDummy}" and os.lineName = "${lineNameDummy}"
                          order by pl.order and pl.journeyPatternSectionId ASC`;

    let queryItems: QueryData[];

    try {
        const queryResult = await executeQuery(serviceQuery);
        queryItems = JSON.parse(JSON.stringify(queryResult));
    } catch (err) {
        throw new Error(`Could not get journey patterns from Dynamo DB: ${err.name}, ${err.message}`);
    }

    const service = queryItems?.[0];
    const rawPatternService: RawJourneyPattern[] = [];

    // allows to get the unique journey's fpr the operator
    const uniqueJourneyPatterns = queryItems.map(item => item.journeyPatternSectionId).filter(
        (value, index, self) => self.indexOf(value) === index,
    );

    uniqueJourneyPatterns.forEach(journey => {
        const filteredJourney = queryItems.filter(item => {
            return item.journeyPatternSectionId === journey;
        });

        // have to get the first record to pull the key information
        const filteredService = filteredJourney[0];

        const journeyPatternSection: RawJourneyPatternSection = {
            Id: filteredService.fromAtcoCode,
            EndPoint: filteredService.toAtcoCode,
            StartPoint: filteredService.fromAtcoCode,
            OrderedStopPoints: filteredJourney.map((data: QueryData) => {
                return {
                    StopPointRef: data.toAtcoCode,
                    CommonName: data.toCommonName,
                };
            }),
        };

        const patternArray: RawJourneyPatternSection[] = [];
        patternArray.push(journeyPatternSection);

        rawPatternService.push({ JourneyPatternSections: patternArray });
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
