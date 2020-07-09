import { NextApiResponse } from 'next';
import { ServerResponse } from 'http';
import { Request, Response } from 'express';
import Cookies from 'cookies';
import { globalSignOut } from '../../../data/cognito';
import {
    FARE_TYPE_ATTRIBUTE,
    ID_TOKEN_ATTRIBUTE,
    REFRESH_TOKEN_ATTRIBUTE,
    OPERATOR_ATTRIBUTE,
} from '../../../constants';
import { NextRequestWithSession } from '../../../interfaces';
import { getSessionAttributes } from '../../../utils/sessions';

type Req = NextRequestWithSession | Request;
type Res = NextApiResponse | Response;

export const setCookieOnResponseObject = (req: Req, res: Res, cookieName: string, cookieValue: string): void => {
    const cookies = new Cookies(req, res);
    // From docs: All cookies are httponly by default, and cookies sent over SSL are secure by
    // default. An error will be thrown if you try to send secure cookies over an insecure socket.
    cookies.set(cookieName, cookieValue, {
        path: '/',
        // The Cookies library applies units of Milliseconds to maxAge. For this reason, maxAge of 24 hours needs to be corrected by a factor of 1000.
        maxAge: 1000 * (3600 * 24),
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== 'development',
    });
};

export const deleteCookieOnResponseObject = (cookieName: string, req: Req, res: Res): void => {
    const cookies = new Cookies(req, res);

    cookies.set(cookieName, '', { overwrite: true, maxAge: 0, path: '/' });
};

export const signOutUser = async (username: string | null, req: Req, res: Res): Promise<void> => {
    if (username) {
        await globalSignOut(username);
    }

    deleteCookieOnResponseObject(ID_TOKEN_ATTRIBUTE, req, res);
    deleteCookieOnResponseObject(REFRESH_TOKEN_ATTRIBUTE, req, res);
    deleteCookieOnResponseObject(OPERATOR_ATTRIBUTE, req, res);
};

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
    const session = getSessionAttributes(req, [FARE_TYPE_ATTRIBUTE]);
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
