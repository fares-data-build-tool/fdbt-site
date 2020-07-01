import AWS, { DynamoDB } from 'aws-sdk';
import express, { Request, Response, Express } from 'express';
import session from 'express-session';
import connectDynamo from 'connect-dynamodb';
import nextjs from 'next';
import requireAuth, { setDisableAuthCookies } from './middleware/authentication';
import setupCsrfProtection from './middleware/csrf';
import setSecurityHeaders from './middleware/security';
import setupLogging from './middleware/logging';

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
    const rootPath = process.env.NODE_ENV === 'development' ? `${__dirname}/..` : `${__dirname}/../..`;

    server.use(
        '/assets',
        express.static(`${rootPath}/node_modules/govuk-frontend/govuk/assets`, {
            maxAge: '365d',
            immutable: true,
        }),
    );

    server.use(
        '/_next/static',
        express.static(`${rootPath}/.next/static`, {
            maxAge: '365d',
            immutable: true,
        }),
    );

    server.use(
        '/scripts',
        express.static(`${rootPath}/node_modules/govuk-frontend/govuk`, {
            maxAge: '365d',
            immutable: true,
        }),
    );
};

(async (): Promise<void> => {
    try {
        await app.prepare();
        const server = express();
        const DynamoDBStore = connectDynamo(session);

        const storeOptions: { table: string; client?: DynamoDB } = {
            table: 'sessions',
        };

        const sessionOptions: session.SessionOptions = {
            cookie: { sameSite: 'strict' },
            saveUninitialized: false,
            resave: false,
            secret: process.env.SESSION_SECRET || 'secret',
        };

        if (process.env.NODE_ENV === 'development') {
            storeOptions.client = new AWS.DynamoDB({
                endpoint: 'http://localhost:4569',
            });
        }

        server.use(
            session({
                store: new DynamoDBStore(storeOptions),
                ...sessionOptions,
            }),
        );

        server.use((req, _res, next) => {
            console.log('ORIGINAL', req.originalUrl);
            if (req.headers && req.headers.referrer) {
                console.log(req.headers.referer);
            }

            next();
        });

        setupLogging(server);
        setStaticRoutes(server);
        setSecurityHeaders(server);
        setDisableAuthCookies(server);
        setupCsrfProtection(server);

        unauthenticatedGetRoutes.forEach(route => {
            server.get(route, (req: Request, res: Response) => {
                res.locals.csrfToken = req.csrfToken();
                (req as any).session.test = 'hello';
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
            (req as any).session.test = 'hello';
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
