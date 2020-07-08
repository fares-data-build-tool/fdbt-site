import jwksClient from 'jwks-rsa';
import { verify, decode, VerifyOptions, JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import { Request, Response, NextFunction, Express } from 'express';
import { ID_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, DISABLE_AUTH_COOKIE, OPERATOR_COOKIE } from '../../src/constants';
import { updateSessionAttribute, getSessionAttributes } from '../../src/utils/sessions';
import { signOutUser } from '../../src/utils';

import { CognitoIdToken, IncomingMessageWithSession } from '../../src/interfaces';
import { initiateRefreshAuth } from '../../src/data/cognito';

const cognitoUri = `https://cognito-idp.eu-west-2.amazonaws.com/${process.env.FDBT_USER_POOL_ID}`;

const jwks = jwksClient({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${cognitoUri}/.well-known/jwks.json`,
});

const getKey = (header: JwtHeader, callback: SigningKeyCallback): void => {
    jwks.getSigningKey(header.kid ?? '', (err, key) => {
        const signingKey = key?.getPublicKey();
        callback(err ?? null, signingKey);
    });
};

const verifyOptions: VerifyOptions = {
    audience: process.env.FDBT_USER_POOL_CLIENT_ID,
    issuer: cognitoUri,
    algorithms: ['RS256'],
};

export const setDisableAuthCookies = (server: Express): void => {
    server.use((req, _res, next) => {
        const isDevelopment = process.env.NODE_ENV === 'development';

        if ((isDevelopment || process.env.ALLOW_DISABLE_AUTH === '1') && req.query.disableAuth === 'true') {
            const { disableAuth } = getSessionAttributes(req as IncomingMessageWithSession, [DISABLE_AUTH_COOKIE]);

            if (!disableAuth || disableAuth === 'false') {
                updateSessionAttribute(req as IncomingMessageWithSession, DISABLE_AUTH_COOKIE, { disableAuth: 'true' });
                updateSessionAttribute(
                    req as IncomingMessageWithSession,
                    ID_TOKEN_COOKIE,
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b206bm9jIjoiQkxBQyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.iQTTEOSf0HZNQsNep3P4npgDp1gyJi8uJHpcGKH7PIM',
                );
                updateSessionAttribute(req as IncomingMessageWithSession, OPERATOR_COOKIE, {
                    operator: {
                        operatorPublicName: 'Blackpool Transport',
                    },
                });
            }
        }

        next();
    });
};

export default (req: Request, res: Response, next: NextFunction): void => {
    const logoutAndRedirect = (username: string | null = null): void => {
        signOutUser(username, req, res)
            .then(() => res.redirect('/login'))
            .catch(error => {
                console.error(`failed to sign out user: ${error.stack}`);
                res.redirect('/login');
            });
    };

    const disableAuth = getSessionAttributes(req as IncomingMessageWithSession, [DISABLE_AUTH_COOKIE]);

    if (
        (process.env.NODE_ENV === 'development' || process.env.ALLOW_DISABLE_AUTH === '1') &&
        (disableAuth.DISABLE_AUTH_COOKIE === 'true' || req.query.disableAuth === 'true')
    ) {
        next();
        return;
    }

    const { idToken } = getSessionAttributes(req as IncomingMessageWithSession, [ID_TOKEN_COOKIE]);

    if (!idToken) {
        res.redirect('/login');
        return;
    }

    verify(idToken, getKey, verifyOptions, err => {
        if (err) {
            const decodedToken = decode(idToken) as CognitoIdToken;
            const username = decodedToken?.['cognito:username'] ?? null;

            if (err.name === 'TokenExpiredError') {
                const { refreshToken } = getSessionAttributes(req as IncomingMessageWithSession, [
                    REFRESH_TOKEN_COOKIE,
                ]);

                if (refreshToken) {
                    console.info('ID Token expired, attempting refresh...');

                    initiateRefreshAuth(username, refreshToken)
                        .then(data => {
                            if (data.AuthenticationResult?.IdToken) {
                                updateSessionAttribute(
                                    req as IncomingMessageWithSession,
                                    ID_TOKEN_COOKIE,
                                    data.AuthenticationResult.IdToken,
                                );
                                console.info('successfully refreshed ID Token');
                                next();

                                return;
                            }

                            logoutAndRedirect(username);
                        })
                        .catch(error => {
                            console.warn(`failed to refresh ID token: ${error.stack}`);
                            logoutAndRedirect(username);
                        });

                    return;
                }
            }

            console.warn('ID Token invalid, clearing user session...');
            logoutAndRedirect(username);

            return;
        }

        next();
    });
};
