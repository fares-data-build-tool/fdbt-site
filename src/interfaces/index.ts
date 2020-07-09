import { AppInitialProps } from 'next/app';
import { NextPageContext, NextApiRequest } from 'next';
import { IncomingMessage } from 'http';
import { DocumentContext } from 'next/document';

export interface ProductInfo {
    productName: string;
    productPrice: string;
    productNameError: string;
    productPriceError: string;
}

export interface ServicesInfo {
    lineName: string;
    startDate: string;
    serviceCode: string;
    serviceDescription?: string;
    checked?: boolean;
}

export interface BasicService {
    lineName: string;
    nocCode: string;
    operatorShortName: string;
    serviceDescription: string;
}

export interface PassengerDetails {
    passengerType: string;
    ageRangeMin?: string;
    ageRangeMax?: string;
    proof?: string[];
}

export interface ErrorInfo {
    errorMessage: string;
    id: string;
}

export interface InputCheck {
    id: string;
    inputValue: string;
    error: string;
}

/* eslint-disable camelcase */
export interface CognitoIdToken {
    sub: string;
    aud: string;
    email_verified: boolean;
    event_id: string;
    'custom:noc': string;
    token_use: string;
    auth_time: number;
    iss: string;
    'cognito:username': string;
    exp: number;
    iat: number;
    email: string;
    'custom:contactable': string;
}

export interface CustomAppProps extends AppInitialProps {
    csrfToken: string;
}

export interface Breadcrumb {
    name: string;
    link: string;
    show: boolean;
}
interface Session {
    session: { [key: string]: any };
}
export type NextContextWithSession = NextPageContext & {
    req: Session;
};

export type DocumentContextWithSession = DocumentContext & {
    req: Session;
};

export type NextRequestWithSession = NextApiRequest & Session;

export type IncomingMessageWithSession = IncomingMessage & Session;

export interface SessionAttributeCollection {
    [key: string]: any;
}
