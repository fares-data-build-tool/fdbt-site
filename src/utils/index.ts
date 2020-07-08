import Cookies from 'cookies';
import { NextApiResponse } from 'next';
import { IncomingMessage } from 'http';
import { Request, Response } from 'express';
import { parseCookies, destroyCookie } from 'nookies';
import { decode } from 'jsonwebtoken';
import {
    NextRequestWithSession,
    NextContextWithSession,
    ErrorInfo,
    CognitoIdToken,
    IncomingMessageWithSession,
} from '../interfaces';
import { globalSignOut } from '../data/cognito';
import { OPERATOR_COOKIE, ID_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, DISABLE_AUTH_COOKIE } from '../constants/index';
import { Stop } from '../data/auroradb';
import { getSessionAttributes } from './sessions';

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

export const unescapeAndDecodeCookie = (cookies: Cookies, cookieToDecode: string): string => {
    return unescape(decodeURI(cookies.get(cookieToDecode) || ''));
};

export const getUuidFromCookie = (req: NextRequestWithSession | Request, res: NextApiResponse | Response): string => {
    const cookies = new Cookies(req, res);
    const operatorCookie = unescapeAndDecodeCookie(cookies, OPERATOR_COOKIE);

    return operatorCookie ? JSON.parse(operatorCookie).uuid : '';
};

export const getCookieValue = (ctx: NextContextWithSession, cookie: string, jsonAttribute = ''): string | null => {
    const cookies = parseCookies(ctx);

    if (cookies[cookie]) {
        if (jsonAttribute) {
            const parsedCookie = JSON.parse(cookies[cookie]);

            return parsedCookie[jsonAttribute];
        }

        return cookies[cookie];
    }

    return null;
};

export const setCookieOnServerSide = (ctx: NextContextWithSession, cookieName: string, cookieValue: string): void => {
    if (ctx.req && ctx.res) {
        const cookies = new Cookies(ctx.req, ctx.res);

        cookies.set(cookieName, cookieValue, {
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV !== 'development',
        });
    }
};

export const deleteCookieOnServerSide = (ctx: NextContextWithSession, cookieName: string): void => {
    if (ctx.req && ctx.res) {
        const cookies = new Cookies(ctx.req, ctx.res);

        cookies.set(cookieName, '', { overwrite: true, maxAge: 0, path: '/' });
    }
};

export const deleteAllCookiesOnServerSide = (ctx: NextContextWithSession): void => {
    const cookies = parseCookies(ctx);
    const cookieWhitelist = [OPERATOR_COOKIE, ID_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, DISABLE_AUTH_COOKIE];

    Object.keys(cookies).forEach(cookie => {
        if (!cookieWhitelist.includes(cookie)) {
            destroyCookie(ctx, cookie);
        }
    });
};

export const getUuidFromCookies = (ctx: NextContextWithSession): string | null => {
    const cookies = parseCookies(ctx);
    const operatorCookie = cookies[OPERATOR_COOKIE];
    if (!operatorCookie) {
        return null;
    }
    const operatorInfo = JSON.parse(operatorCookie);
    return operatorInfo.uuid;
};

export const signOutUser = async (username: string | null, req: Req, res: Res): Promise<void> => {
    if (username) {
        await globalSignOut(username);
    }

    deleteCookieOnResponseObject(ID_TOKEN_COOKIE, req, res);
    deleteCookieOnResponseObject(REFRESH_TOKEN_COOKIE, req, res);
    deleteCookieOnResponseObject(OPERATOR_COOKIE, req, res);
};

export const getHost = (req: IncomingMessage | undefined): string => {
    if (!req) {
        return '';
    }
    const host = req?.headers?.host;

    if (host) {
        if (host && host.startsWith('localhost')) {
            return `http://${host}`;
        }
        return `https://${host}`;
    }

    return '';
};

export const getJourneyPatternFromCookies = (ctx: NextContextWithSession): string | null => {
    const cookies = parseCookies(ctx);
    const operatorCookie = cookies[OPERATOR_COOKIE];
    if (!operatorCookie) {
        return null;
    }
    const operatorInfo = JSON.parse(operatorCookie);
    return operatorInfo.journeyPattern;
};

export const formatStopName = (stop: Stop): string =>
    `${stop.localityName ? `${stop.localityName}, ` : ''}${stop.indicator ?? ''} ${stop.stopName ?? ''}${
        stop.street ? ` (on ${stop.street})` : ''
    }`;

export const buildTitle = (errors: ErrorInfo[], title: string): string => {
    if (errors.length > 0) {
        return `Error: ${title}`;
    }

    return title;
};

export const getAttributeFromIdToken = <T extends keyof CognitoIdToken>(
    req: IncomingMessageWithSession,
    attribute: T,
): CognitoIdToken[T] | null => {
    const { idToken } = getSessionAttributes(req, [ID_TOKEN_COOKIE]);

    if (!idToken) {
        return null;
    }

    const decodedIdToken = decode(idToken) as CognitoIdToken;

    return decodedIdToken[attribute] ?? null;
};

export const getNocFromIdToken = (req: IncomingMessageWithSession): string | null =>
    getAttributeFromIdToken(req, 'custom:noc');

export const checkEmailValid = (email: string): boolean => {
    const emailRegex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    return emailRegex.test(email) && email !== '';
};

export const getSelectedStages = (req: NextRequestWithSession): string[] => {
    const requestBody = req.body;

    const selectObjectsArray: string[] = [];

    Object.keys(requestBody).map(e => {
        if (requestBody[e] !== '') {
            selectObjectsArray.push(requestBody[e]);
        }
        return null;
    });

    return selectObjectsArray;
};

export const validateNewPassword = (
    password: string,
    confirmPassword: string,
    inputChecks: ErrorInfo[],
): ErrorInfo[] => {
    let passwordError = '';
    if (password.length < 8) {
        passwordError = password.length === 0 ? 'Enter a new password' : 'Password must be at least 8 characters long';
        inputChecks.push({ id: 'new-password', errorMessage: passwordError });
    } else if (password !== confirmPassword) {
        inputChecks.push({ id: 'new-password', errorMessage: 'Passwords do not match' });
    }
    return inputChecks;
};
