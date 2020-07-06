import { Express } from 'express';
import AWS from 'aws-sdk';
import session, { SessionOptions } from 'express-session';
import connectDynamoDb from 'connect-dynamodb';

export default (server: Express): void => {
    const DynamoDbStore = connectDynamoDb(session);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamoDbOptions: any = {
        table: 'sessions',
        AWSConfigJSON: {
            region: 'eu-west-2',
        },
    };

    if (process.env.NODE_ENV === 'development') {
        dynamoDbOptions.client = new AWS.DynamoDB({ endpoint: 'http://localhost:4569', region: 'eu-west-2' });
    }

    const sessionOptions: SessionOptions = {
        cookie: {
            sameSite: true,
        },
        saveUninitialized: false,
        resave: false,
        secret: process.env.SESSION_SECRET || 'secret',
        store: new DynamoDbStore(dynamoDbOptions),
    };

    server.use(session(sessionOptions));
};
