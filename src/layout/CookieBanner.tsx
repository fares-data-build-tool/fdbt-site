import React, { FC } from 'react';
import axios from 'axios';

const handleAcceptAllClick = async (): Promise<void> => {
    await axios.post('/api/cookies', { tracking: 'on' });
};

const CookieBanner: FC = () => (
    <div id="global-cookie-message" className="cookie-banner" role="region" aria-label="cookie banner">
        <div className="govuk-width-container">
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <div className="cookie-banner__message">
                        <h2 className="govuk-heading-m">Tell us whether you accept cookies</h2>
                        <p className="govuk-body">
                            We use{' '}
                            <a className="govuk-link" href="/cookieDetails">
                                cookies to collect information
                            </a>{' '}
                            about how you use the Fares Data Build Tool. We use this information to make the website
                            work as well as possible and to improve the service.
                        </p>
                    </div>
                    <div className="cookie-banner__button govuk-grid-column-full govuk-grid-column-one-half-from-desktop">
                        <button
                            id="accept-all-cookies-link"
                            className="govuk-button cookie-banner__button--inline"
                            type="submit"
                            onClick={async (): Promise<void> => handleAcceptAllClick()}
                        >
                            Accept all cookies
                        </button>
                    </div>
                    <div className="cookie-banner__button govuk-grid-column-full govuk-grid-column-one-half-from-desktop">
                        <a
                            id="set-cookie-preferences-link"
                            className="govuk-button cookie-banner__button--inline"
                            role="button"
                            href="/cookies"
                        >
                            Set cookie preferences
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default CookieBanner;
