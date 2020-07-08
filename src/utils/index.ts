import Cookies from 'cookies';
import { NextPageContext } from 'next';
import { IncomingMessage } from 'http';
import { parseCookies, destroyCookie } from 'nookies';
import { decode } from 'jsonwebtoken';
import { OPERATOR_COOKIE, ID_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, DISABLE_AUTH_COOKIE } from '../constants/index';
import { Stop } from '../data/auroradb';
import { ErrorInfo, CognitoIdToken, SessionAttributeCollection } from '../interfaces';

export const getCookieValue = (ctx: NextPageContext, cookie: string, jsonAttribute = ''): string | null => {
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

export const getSessionAttributesOnServerSide = (
    ctx: NextPageContext,
    attributes: string[],
): SessionAttributeCollection => {
    const attributeCollection: SessionAttributeCollection = {};
    if (ctx.req) {
        attributes.forEach(attribute => {
            attributeCollection[attribute] = (ctx.req as any).session[attribute];
        });
    }
    return attributeCollection;
};

export const updateSessionAttributeOnServerSide = (
    ctx: NextPageContext,
    attributeName: string,
    attributeValue: string | {},
): void => {
    if (ctx.req) {
        (ctx.req as any).session[attributeName] = attributeValue;
    }
};

export const overwriteSessionOnServerSide = (ctx: NextPageContext, session: {}): void => {
    if (ctx.req) {
        (ctx.req as any).session = session;
    }
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

export const getJourneyPatternFromCookies = (ctx: NextPageContext): string | null => {
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
