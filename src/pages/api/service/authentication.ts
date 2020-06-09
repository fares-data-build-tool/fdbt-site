/* eslint-disable import/prefer-default-export */
import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import exjwt from 'express-jwt';
import jwksClient from 'jwks-rsa';
import { ID_TOKEN_COOKIE } from '../../../constants';

const getIdToken = (req: NextApiRequest, res: NextApiResponse): string => {
    const cookies = new Cookies(req, res);
    const idToken = cookies.get(ID_TOKEN_COOKIE);
    if (!idToken) {
        console.log('Could not retrieve ID taken from cookie');
    }
    return idToken || '';
};

const client = jwksClient({
    jwksUri: `https://cognito-idp.eu-west-2.amazonaws.com/${process.env.FDBT_USER_POOL_ID}/.well-known/jwks.json`,
});
const getKey = (header: { kid: string }, callback: any): void => {
    client.getSigningKey(header.kid, (_err: Error | null, key: SigningKey) => {
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
};

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

export const verifyToken = async (): Promise<void> => {
    const result = await fetch('/api/validateToken', {
        method: 'POST',
        body: JSON.stringify({ token: 'aaaaaa' }),
    });
    console.log(result);
    // const token = getIdToken(req, res);
    // app.get(token, exjwt({ secret: publicKey }), (req, res) => {
    //     if (error) {
    //         console.log('Verification failed');
    //     }
    //     console.log('Verification successful!');
};
