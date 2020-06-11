import express, { Request, Response, Express } from 'express';
import morgan from 'morgan';
import nextjs from 'next';
import nocache from 'nocache';
import Cookies from 'cookies';
import requireAuth from './middleware/authentication';
import setupCsrf from './middleware/csrf';
import setSecurityHeaders from './middleware/security';
import { DISABLE_AUTH_COOKIE, ID_TOKEN_COOKIE, OPERATOR_COOKIE } from '../src/constants';

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
    '/resetPasswordSuccess',
    '/resetLinkExpired',
    '/_next/*',
    '/assets/*',
    '/scripts/*',
    '/error',
];

const unauthenticatedPostRoutes = ['/api/login', '/api/register', '/api/forgotPassword', '/api/resetPassword'];

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

(async (): Promise<void> => {
    try {
        await app.prepare();

        const server = express();

        server.use(
            morgan('short', {
                skip: req => req.originalUrl.startsWith('/_next') || req.originalUrl.startsWith('/assets'),
            }),
        );

        setStaticRoutes(server);
        setSecurityHeaders(server);

        server.use(nocache());

        server.use((req, res, next) => {
            if (
                (process.env.NODE_ENV === 'development' || process.env.ALLOW_DISABLE_AUTH === '1') &&
                req.query.disableAuth === 'true'
            ) {
                const cookies = new Cookies(req, res);
                const disableAuthCookie = cookies.get(DISABLE_AUTH_COOKIE);

                if (!disableAuthCookie || disableAuthCookie === 'false') {
                    cookies.set(DISABLE_AUTH_COOKIE, 'true');
                    cookies.set(
                        ID_TOKEN_COOKIE,
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b206bm9jIjoiQkxBQyJ9.-1CZzSU-mmUoLn_RpWvrBKOib2tu_SXE2FQ1HmNYnZk',
                    );
                    cookies.set(
                        OPERATOR_COOKIE,
                        JSON.stringify({
                            operator: {
                                operatorPublicName: 'Blackpool Transport',
                            },
                            uuid: '0d1953f5-f57a-4ae3-8522-fef7da34c567',
                        }),
                    );
                }
            }

            next();
        });

        setupCsrf(server);

        unauthenticatedGetRoutes.forEach(route => {
            server.get(route, (req: Request, res: Response) => {
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
            res.locals.csrfToken = req.csrfToken();
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
