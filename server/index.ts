import express, { Request, Response, Express } from 'express';
import morgan from 'morgan';
import nextjs from 'next';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import helmet from 'helmet';
import nocache from 'nocache';
import { v4 as uuidv4 } from 'uuid';
import requireAuth from './middleware/authentication';

const dev = process.env.NODE_ENV !== 'production';
const app = nextjs({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 5555;

const unauthenticatedGetRoutes = [
    '/',
    '/login',
    '/register',
    '/confirmRegistration',
    '/forgotPassword',
    '/resetConfirmation',
    '/resetPassword',
    '/_next/*',
    '/assets/*',
    '/scripts/*',
];

const unauthenticatedPostRoutes = ['/api/login', '/api/register', '/api/forgotPassword'];

const setStaticRoutes = (server: Express): void => {
    server.use(
        '/assets',
        express.static(`${__dirname}/../node_modules/govuk-frontend/govuk/assets`, {
            maxAge: '365d',
            immutable: true,
        }),
    );

    server.use(
        '/_next/static',
        express.static(`${__dirname}/../.next/static`, {
            maxAge: '365d',
            immutable: true,
        }),
    );

    server.use(
        '/scripts',
        express.static(`${__dirname}/../node_modules/govuk-frontend/govuk`, {
            maxAge: '365d',
            immutable: true,
        }),
    );
};

const setHeaders = (server: Express): void => {
    server.use((_req, res, next) => {
        res.locals.nonce = Buffer.from(uuidv4()).toString('base64');
        next();
    });

    server.disable('x-powered-by');

    const nonce = (_req: Request, res: Response): string => `'nonce-${res.locals.nonce}'`;
    const scriptSrc = [nonce, "'strict-dynamic'"];
    const styleSrc = ["'self'"];

    if (process.env.NODE_ENV !== 'production') {
        scriptSrc.push("'unsafe-eval'");
        scriptSrc.push("'unsafe-inline'");
        styleSrc.push("'unsafe-inline'");
    }

    server.use(
        helmet({
            frameguard: {
                action: 'deny',
            },
            noSniff: true,
            contentSecurityPolicy: {
                directives: {
                    objectSrc: ["'none'"],
                    frameAncestors: ["'none'"],
                    scriptSrc,
                    baseUri: ["'none'"],
                    styleSrc,
                    imgSrc: ["'self'", 'data:', 'https:'],
                    defaultSrc: ["'self'"],
                },
            },
            hsts: {
                includeSubDomains: true,
                maxAge: 31536000,
            },
            expectCt: {
                maxAge: 86400,
                enforce: true,
            },
            referrerPolicy: {
                policy: 'same-origin',
            },
        }),
    );
};

(async (): Promise<void> => {
    try {
        await app.prepare();

        const server = express();

        server.use(
            morgan('short', {
                skip: req => req.originalUrl.startsWith('/_next') || req.originalUrl.startsWith('/assets'),
            }),
        );

        setHeaders(server);

        setStaticRoutes(server);

        server.use(nocache());

        server.use(cookieParser());

        server.use(
            csurf({
                cookie: {
                    secure: process.env.NODE_ENV !== 'development',
                    httpOnly: true,
                },
                value: req => req.cookies.csrfToken,
            }),
        );

        unauthenticatedGetRoutes.forEach(route => {
            server.get(route, (req: Request, res: Response) => {
                res.cookie('csrfToken', req.csrfToken ? req.csrfToken() : null, { sameSite: true, httpOnly: true });
                res.locals.csrfToken = req.csrfToken();
                return handle(req, res);
            });
        });

        unauthenticatedPostRoutes.forEach(route => {
            server.post(route, (req: Request, res: Response) => {
                return handle(req, res);
            });
        });

        server.get('*', requireAuth, (req: Request, res: Response) => {
            res.cookie('csrfToken', req.csrfToken ? req.csrfToken() : null, { sameSite: true, httpOnly: true });
            return handle(req, res);
        });

        server.all('*', requireAuth, (req: Request, res: Response) => {
            return handle(req, res);
        });

        server.listen(port, (err?: Error) => {
            if (err) {
                throw err;
            }
            console.info(`> Ready on http://localhost:${port} - env ${process.env.NODE_ENV}`);
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
