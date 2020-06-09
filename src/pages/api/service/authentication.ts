import * as express from 'express';
import { parseCookies } from 'nookies';
import { NextPageContext } from 'next';
import { ID_TOKEN_COOKIE } from '../../../constants';
import * as jsonwebtoken from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import * as request from 'request';
import { get } from 'request';


interface JsonWebKey {
    kid: string;
    alg: string;
    kty: string
    e: string;
    n: string;
    use: string;
}



// Retrieves ID Token from ID_TOKEN_COOKIE
const getIdTokenFromCookie = (ctx: NextPageContext): string => {
    const cookies = parseCookies(ctx);
    const idTokenCookie = cookies[ID_TOKEN_COOKIE];
    const idTokenCookieParsed = JSON.parse(idTokenCookie);
    const { idToken }  = idTokenCookieParsed;
    return idToken;
};




// Retrieves Public Key from Cognito
const getPublicKeyfromCognito = () => {
    const publicKey = get({
        url: `https://cognito-idp.eu-west-2.amazonaws.com/8Bt13tfnT/.well-known/jwks.json`,
        json: true
}, (error, response, body) => {if (publicKey && express.response.statusCode === 200) {
    const pems: JsonWebKey []= [];
                
    const keys = publicKey[keys];
                
    for(let i = 0; i < keys.length; i++) {
        let key_id = keys[i].kid;
        let modulus = keys[i].n;
        let exponent = keys[i].e;
        let key_type = keys[i].kty;
        let jwk = { kty: key_type, n: modulus, e: exponent};
        let pem = jwkToPem(jwk);
        pems[key_id] = pem;
}});




// Compares Key on ID Token to Key retrieved from Cognito



// Validates signature



// Validates not expired




// Uses Refresh Token to obtain new ID Token





