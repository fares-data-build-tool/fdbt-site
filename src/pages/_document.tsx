import Document, { Html, Head, Main, NextScript, DocumentInitialProps } from 'next/document';
import React, { ReactElement } from 'react';
import { ServerResponse } from 'http';
import { parseCookies } from 'nookies';
import Header from '../layout/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import { COOKIES_POLICY_COOKIE, ID_TOKEN_COOKIE } from '../constants';
import Banner from '../layout/Banner';
import { Breadcrumb, DocumentContextWithSession } from '../interfaces';
import Footer from '../layout/Footer';
import breadcrumb from '../utils/breadcrumbs';
import Help from '../components/Help';

interface DocumentProps extends DocumentInitialProps {
    nonce: string;
    isAuthed: boolean;
    csrfToken: string;
    breadcrumbs: Breadcrumb[];
    url: string;
    allowTracking: boolean;
}

interface ResponseWithLocals extends ServerResponse {
    locals: {
        nonce: string;
        csrfToken: string;
    };
}

class MyDocument extends Document<DocumentProps> {
    static async getInitialProps(ctx: DocumentContextWithSession): Promise<DocumentProps> {
        const initialProps = await Document.getInitialProps(ctx);
        const nonce = (ctx.res as ResponseWithLocals)?.locals?.nonce ?? null;
        const csrfToken = (ctx.res as ResponseWithLocals)?.locals?.csrfToken ?? null;

        if (ctx.pathname !== '/') {
            ctx.res?.setHeader('X-Robots-Tag', 'none, noindex, nofollow, noimageindex, noarchive');
        }

        const cookies = parseCookies(ctx);
        const idTokenCookie = cookies[ID_TOKEN_COOKIE];
        const allowTracking = cookies[COOKIES_POLICY_COOKIE] ? JSON.parse(cookies[COOKIES_POLICY_COOKIE]).usage : false;

        const breadcrumbs = breadcrumb(ctx).generate();

        const url = ctx.req?.url ?? '';

        return {
            ...initialProps,
            nonce,
            isAuthed: !!idTokenCookie,
            csrfToken,
            breadcrumbs,
            url,
            allowTracking,
        };
    }

    render(): ReactElement {
        return (
            <Html lang="en" className="govuk-template app-html-class flexbox no-flexboxtweener">
                <Head nonce={this.props.nonce}>
                    {process.env.STAGE === 'prod' && (
                        <>
                            <script
                                async
                                src="https://www.googletagmanager.com/gtag/js?id=UA-173062045-1"
                                nonce={this.props.nonce}
                            />
                            <script
                                nonce={this.props.nonce}
                                // eslint-disable-next-line react/no-danger
                                dangerouslySetInnerHTML={{
                                    __html: `window['ga-disable-UA-173062045-1'] = ${!this.props.allowTracking};
                                        window.dataLayer = window.dataLayer || [];
                                        function gtag(){dataLayer.push(arguments);}
                                        gtag('js', new Date());
                                        gtag('config', 'UA-173062045-1');`,
                                }}
                            />
                        </>
                    )}
                </Head>
                <body className="govuk-template__body app-body-class js-enabled">
                    <a href="#main-content" className="govuk-skip-link">
                        Skip to main content
                    </a>
                    <Header isAuthed={this.props.isAuthed} csrfToken={this.props.csrfToken} />
                    <div className="govuk-width-container app-width-container--wide">
                        <Banner />
                        {this.props.breadcrumbs.length !== 0 && <Breadcrumbs breadcrumbs={this.props.breadcrumbs} />}
                        <main id="main-content" role="main" tabIndex={-1}>
                            <div className="govuk-main-wrapper app-main-class">
                                <Main />
                            </div>
                        </main>
                        {this.props.url !== '/contact' ? <Help /> : null}
                    </div>
                    <Footer />
                    <NextScript nonce={this.props.nonce} />
                    <script src="/scripts/all.js" nonce={this.props.nonce} />
                    <script nonce={this.props.nonce}>window.GOVUKFrontend.initAll()</script>
                </body>
            </Html>
        );
    }
}

export default MyDocument;
