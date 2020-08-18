import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import { ServerResponse } from 'http';
import { Request, Response } from 'express';
import { decode } from 'jsonwebtoken';
import { OPERATOR_COOKIE, FARE_TYPE_COOKIE, ID_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../../../constants';
import { CognitoIdToken, ErrorInfo } from '../../../interfaces';
import { globalSignOut } from '../../../data/cognito';
import logger from '../../../utils/logger';

type Req = NextApiRequest | Request;
type Res = NextApiResponse | Response;

export const setCookieOnResponseObject = (cookieName: string, cookieValue: string, req: Req, res: Res): void => {
    const cookies = new Cookies(req, res);
    // From docs: All cookies are httponly by default, and cookies sent over SSL are secure by
    // default. An error will be thrown if you try to send secure cookies over an insecure socket.
    cookies.set(cookieName, cookieValue, {
        path: '/',
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

export const getUuidFromCookie = (req: NextApiRequest | Request, res: NextApiResponse | Response): string => {
    const cookies = new Cookies(req, res);
    const operatorCookie = unescapeAndDecodeCookie(cookies, OPERATOR_COOKIE);

    return operatorCookie ? JSON.parse(operatorCookie).uuid : '';
};

export const redirectTo = (res: NextApiResponse | ServerResponse, location: string): void => {
    res.writeHead(302, {
        Location: location,
    });
    res.end();
};

export const redirectToError = (
    res: NextApiResponse | ServerResponse,
    message: string,
    context: string,
    error: any, // eslint-disable-line @typescript-eslint/no-explicit-any
): void => {
    logger.error(error, { context, message });
    redirectTo(res, '/error');
};

export const redirectOnFareType = (req: NextApiRequest, res: NextApiResponse): void => {
    const cookies = new Cookies(req, res);
    const fareTypeCookie = unescapeAndDecodeCookie(cookies, FARE_TYPE_COOKIE);
    const { fareType } = JSON.parse(fareTypeCookie);

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
        throw new Error('Could not extract fareType from the FARE_TYPE_COOKIE.');
    }
};

export const checkEmailValid = (email: string): boolean => {
    const emailRegex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    return emailRegex.test(email) && email !== '';
};

export const getAttributeFromIdToken = <T extends keyof CognitoIdToken>(
    req: NextApiRequest,
    res: NextApiResponse,
    attribute: T,
): CognitoIdToken[T] | null => {
    const cookies = new Cookies(req, res);
    const idToken = cookies.get(ID_TOKEN_COOKIE);

    if (!idToken) {
        return null;
    }

    const decodedIdToken = decode(idToken) as CognitoIdToken;

    return decodedIdToken[attribute] ?? null;
};

export const getNocFromIdToken = (req: NextApiRequest, res: NextApiResponse): string | null =>
    getAttributeFromIdToken(req, res, 'custom:noc');

export const signOutUser = async (username: string | null, req: Req, res: Res): Promise<void> => {
    if (username) {
        await globalSignOut(username);
    }

    deleteCookieOnResponseObject(ID_TOKEN_COOKIE, req, res);
    deleteCookieOnResponseObject(REFRESH_TOKEN_COOKIE, req, res);
    deleteCookieOnResponseObject(OPERATOR_COOKIE, req, res);
};

export const getSelectedStages = (req: NextApiRequest): string[] => {
    const requestBody = req.body;

    const selectObjectsArray: string[] = [];

    Object.keys(requestBody).map((e) => {
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
