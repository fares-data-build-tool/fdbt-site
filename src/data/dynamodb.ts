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

export interface RawJourneyPatternSection {
    Id: string;
    OrderedStopPoints: {
        StopPointRef: string;
        CommonName: string;
    }[];
    StartPoint: string; //fromAtcoCode
    EndPoint: string; //ToAtcoCode
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

    console.log('client', client);
    return client;
};

const auroraConnection = getAuroraDBClient();


export const convertDateFormat = (startDate: string): string => {
    return dateFormat(startDate, 'dd/mm/yyyy');
};

const executeQuery = async (query: string) => {
    const connection = await auroraConnection;
    const [rows] = await connection.execute(query, []);
    //connection.end();
    return rows;
};

export const getServicesByNocCode = async (nocCode: string): Promise<ServiceType[]> => {
    try {
        const tableName = process.env.NODE_ENV === 'development' ? 'tndsService' :  SERVICES_TABLE_NAME;

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

    const serviceQuery = `Select * from ${tableName} where nocCode = "IWCB" AND lineName = "200
    INNER JOIN "`;
    let Items;

    try {
        console.log('service query', serviceQuery);
        const queryResult = await executeQuery(serviceQuery);

        Items = JSON.parse(JSON.stringify(queryResult));

    } catch (err) {
        throw new Error(`Could not get journey patterns from Dynamo DB: ${err.name}, ${err.message}`);
    }

    const service = Items?.[0];

    console.log('heyyy', service);

    // if (!service || !service.JourneyPatterns || service.JourneyPatterns.length === 0) {
    if(!service) {
        throw new Error(`No journey patterns found for nocCode: ${nocCode}, lineName: ${lineName}`);
    }

    return {
        serviceDescription: service.ServiceDescription,
        operatorShortName: service.OperatorShortName,
        journeyPatterns: service.JourneyPatterns,
    };
};
