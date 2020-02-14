import Cookies from 'cookies';
import { NextPageContext } from 'next';
import { IncomingMessage } from 'http';
import axios from 'axios';
import { parseCookies } from 'nookies';
import { SERVICE_COOKIE } from '../constants';

export const deleteCookieOnServerSide = (ctx: NextPageContext, cookieName: string): void => {
    if (ctx.req && ctx.res) {
        const cookies = new Cookies(ctx.req, ctx.res);
        const date = new Date();
        const host = ctx?.req?.headers?.host;
        const domain = host && host.split(':')[0];

        date.setDate(date.getDate() - 1);
        cookies.set(cookieName, '', { overwrite: true, expires: date, domain, path: '/' });
    }
};

export const getHost = (req: IncomingMessage | undefined): string => {
    if (!req) {
        return '';
    }
    const host = req?.headers?.host;
    if (host && host.startsWith('localhost')) {
        return `http://${host}`;
    }
    return `https://${host}`;
};

export const isSessionValid = async (url: string, req: IncomingMessage | undefined): Promise<boolean> => {
    try {
        const response = await axios.get(url, {
            withCredentials: true,
            headers: {
                Cookie: req?.headers.cookie,
            },
        });

        return response.data.Valid;
    } catch (err) {
        return false;
    }
};

export const getUuidFromCookies = (ctx: NextPageContext) => {
    const cookies = parseCookies(ctx);
    const serviceCookie = cookies[SERVICE_COOKIE];
    if (!serviceCookie) {
        return {};
    }
    const serviceObject = JSON.parse(serviceCookie);
    return serviceObject.uuid;
};
