import { Express } from 'express';
import AWS from 'aws-sdk';
import session from 'express-session';
import dynamoDbStore from 'connect-dynamodb';

export default (server: Express): void => {
    const dynamoDbOptions =
        process.env.NODE_ENV === 'development'
            ? {
                  table: 'sessions',
                  client: new AWS.DynamoDB({ endpoint: 'http://localhost:4569' }),
              }
            : {
                  table: 'sessions',
              };

    const sessionOptions = {
        cookie: {
            sameSite: true,
        },
        saveUninitialized: false,
        resave: false,
        secret: process.env.SESSION_SECRET || 'secret',
        store: dynamoDbStore(dynamoDbOptions),
    };

    server.use(session(sessionOptions));
};
