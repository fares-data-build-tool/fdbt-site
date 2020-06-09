/* eslint-disable import/prefer-default-export */
import Cookies from 'cookies';
// import jwt from 'express-jwt';
import jwksClient from 'jwks-rsa';
import { verify, GetPublicKeyOrSecret } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { ID_TOKEN_COOKIE } from '../../src/constants';

const getIdToken = (req: Request, res: Response): string => {
    const cookies = new Cookies(req, res);
    const idToken = cookies.get(ID_TOKEN_COOKIE);
    if (!idToken) {
        console.log('Could not retrieve ID taken from cookie');
    }
    return idToken || '';
};

// const client = jwksClient({
//     jwksUri: `https://cognito-idp.eu-west-2.amazonaws.com/${process.env.FDBT_USER_POOL_ID}/.well-known/jwks.json`,
// });
// const getKey = (header: { kid: string }, callback: any): void => {
//     client.getSigningKey(header.kid, (_err: Error | null, key: SigningKey) => {
//         const signingKey = key.getPublicKey();
//         callback(null, signingKey);
//     });
// };

// export const verifyToken = (req: NextApiRequest, res: NextApiResponse): void => {
//     const token = getIdToken(req, res);
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     verify(token, getKey, {}, (error: VerifyErrors | null, _decoded: {} | undefined) => {
//         if (error) {
//             console.log('Verification failed.');
//         }
//         console.log('Verification successful!');
//     });
// };

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    const cognitoUri = `https://cognito-idp.eu-west-2.amazonaws.com/${process.env.FDBT_USER_POOL_ID}`;

    console.log(req.url);

    const jwks = jwksClient({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${cognitoUri}/.well-known/jwks.json`,
    });

    const getKey: GetPublicKeyOrSecret = (header, callback): void => {
        if (!header.kid) {
            throw new Error();
        }

        jwks.getSigningKey(header.kid, (_err, key) => {
            const signingKey = key.getPublicKey();
            callback(null, signingKey);
        });
    };

    verify(getIdToken(req, res), getKey, {}, err => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                // REFRESH
            }

            // DELETE COOKIES AND PERFORM SIGN OUT IF USERNAME PRESENT
            res.redirect('/login');
            return;
        }

        next();
    });

    // console.log('HELLO');

    // const jwtCheck = jwt({
    //     secret: jwksClient.expressJwtSecret({
    //         cache: true,
    //         rateLimit: true,
    //         jwksRequestsPerMinute: 5,
    //         jwksUri: `${cognitoUri}/.well-known/jwks.json`,
    //     }),
    //     audience: process.env.FDBT_USER_POOL_CLIENT_ID,
    //     issuer: cognitoUri,
    //     algorithms: ['RS256'],
    //     getToken: (): string => {
    //         const cookies = new Cookies(req, res);
    //         const idToken = cookies.get(ID_TOKEN_COOKIE);
    //         if (!idToken) {
    //             console.log('Could not retrieve ID taken from cookie');
    //         }

    //         console.log('ID TOKEN', idToken);
    //         return idToken || '';
    //     },
    // });

    // console.log(jwtCheck);

    // const token = getIdToken(req, res);
    // app.get(token, exjwt({ secret: publicKey }), (req, res) => {
    //     if (error) {
    //         console.log('Verification failed');
    //     }
    //     console.log('Verification successful!');
};
