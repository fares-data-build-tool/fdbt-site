import { NextApiResponse } from 'next';
import { ServerResponse } from 'http';
import { FARE_TYPE_COOKIE } from '../constants';
import { NextRequestWithSession } from '../interfaces';
import { getSessionAttributes } from './sessions';

export const redirectTo = (res: NextApiResponse | ServerResponse, location: string): void => {
    res.writeHead(302, {
        Location: location,
    });
    res.end();
};

export const redirectToError = (res: NextApiResponse | ServerResponse, message: string, error: Error): void => {
    console.error(message, error.stack);
    redirectTo(res, '/error');
};

export const redirectOnFareType = (req: NextRequestWithSession, res: NextApiResponse): void => {
    const session = getSessionAttributes(req, [FARE_TYPE_COOKIE]);
    const { fareType } = session;

    if (fareType) {
        switch (fareType) {
            case 'period':
                redirectTo(res, '/periodType');
                return;
            case 'single':
                redirectTo(res, '/service');
                return;
            case 'return':
                redirectTo(res, '/service');
                return;
            case 'flatFare':
                redirectTo(res, '/serviceList');
                return;
            default:
                throw new Error('Fare Type we expect was not received.');
        }
    } else {
        throw new Error('Could not extract fareType from the session.');
    }
};
