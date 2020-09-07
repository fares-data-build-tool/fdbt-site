import Cookies from 'cookies';
import { NextPageContext } from 'next';
import { IncomingMessage } from 'http';
import { parseCookies, destroyCookie } from 'nookies';
import { decode } from 'jsonwebtoken';
import { OPERATOR_COOKIE, ID_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, DISABLE_AUTH_COOKIE } from '../constants/index';
import { ErrorInfo, CognitoIdToken, NextPageContextWithSession, Stop } from '../interfaces';

const getCookieValue = (ctx: NextPageContext, cookie: string, jsonAttribute = ''): string | null => {
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

export const setCookieOnServerSide = (ctx: NextPageContext, cookieName: string, cookieValue: string): void => {
    if (ctx.req && ctx.res) {
        const cookies = new Cookies(ctx.req, ctx.res);

        cookies.set(cookieName, cookieValue, {
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV !== 'development',
        });
    }
};

export const deleteCookieOnServerSide = (ctx: NextPageContext, cookieName: string): void => {
    if (ctx.req && ctx.res) {
        const cookies = new Cookies(ctx.req, ctx.res);

        cookies.set(cookieName, '', { overwrite: true, maxAge: 0, path: '/' });
    }
};

export const deleteAllCookiesOnServerSide = (ctx: NextPageContext): void => {
    const cookies = parseCookies(ctx);
    const cookieWhitelist = [OPERATOR_COOKIE, ID_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, DISABLE_AUTH_COOKIE];

    Object.keys(cookies).forEach(cookie => {
        if (!cookieWhitelist.includes(cookie)) {
            destroyCookie(ctx, cookie);
        }
    });
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

export const getUuidFromCookies = (ctx: NextPageContext): string | null => {
    const cookies = parseCookies(ctx);
    const operatorCookie = cookies[OPERATOR_COOKIE];
    if (!operatorCookie) {
        return null;
    }
    const operatorInfo = JSON.parse(operatorCookie);

    return operatorInfo.uuid;
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
    ctx: NextPageContext,
    attribute: T,
): CognitoIdToken[T] | null => {
    const cookies = parseCookies(ctx);
    const idToken = cookies[ID_TOKEN_COOKIE];

    if (!idToken) {
        return null;
    }

    const decodedIdToken = decode(idToken) as CognitoIdToken;

    return decodedIdToken[attribute] ?? null;
};

export const getNocFromIdToken = (ctx: NextPageContext): string | null => getAttributeFromIdToken(ctx, 'custom:noc');

export const getAndValidateNoc = (ctx: NextPageContext): string => {
    const idTokenNoc = getNocFromIdToken(ctx);
    const cookieNoc = getCookieValue(ctx, OPERATOR_COOKIE, 'noc');

    const splitNoc = idTokenNoc?.split('|');

    if (cookieNoc && idTokenNoc && splitNoc?.includes(cookieNoc)) {
        return cookieNoc;
    }

    throw new Error('invalid NOC set');
};

export const getErrorsByIds = (ids: string[], errors: ErrorInfo[]): ErrorInfo[] => {
    const compactErrors: ErrorInfo[] = [];
    errors.forEach(error => {
        if (ids.includes(error.id)) {
            compactErrors.push(error);
        }
    });

    return compactErrors;
};

export const checkIfMultipleOperators = (ctx: NextPageContextWithSession): boolean => {
    const databaseNocs = getNocFromIdToken(ctx);
    let nocs = [];
    if (databaseNocs) {
        nocs = databaseNocs.split('|');
    }

    return nocs?.length > 1;
};
