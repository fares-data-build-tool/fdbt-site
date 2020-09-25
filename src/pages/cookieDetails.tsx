import React, { ReactElement } from 'react';
import { FullColumnLayout } from '../layout/Layout';

const title = 'Cookie details - Fares Data Build Tool';
const description = 'Cookie details page for the Fares Data Build Tool';

const Contact = (): ReactElement => {
    return (
        <FullColumnLayout title={title} description={description}>
            <h1 className="govuk-heading-xl">Details about cookies on the Fares Data Build Tool</h1>
            <p className="govuk-body">
                Fares Data Build Tool puts small files (known as ‘cookies’) onto your computer to collect information
                about how you browse the site. Find out more about the cookies we use, what they’re for and when they
                expire.
            </p>
            <h1 className="govuk-heading-m">Tracking</h1>
            <p className="govuk-body">
                We use Google Analytics software (Universal Analytics) to collect anonymised information about how you
                use Fares Data Build Tool. We do this to help make sure the site is meeting the needs of its users and
                to help us make improvements to the site and to government digital services.
            </p>
            <p className="govuk-body">We do not allow Google to use or share the data about how you use this site.</p>
            <ul className="govuk-list govuk-list--bullet govuk-body">
                <li>how you got to the site</li>
                <li>the pages you visit on GOV.UK and how long you spend on them</li>
                <li>what you click on while you’re visiting the site</li>
            </ul>
            <p className="govuk-body">Google Analytics sets the following cookies.</p>
            <table className="govuk-table">
                <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header">
                            Name
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Purpose
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Expires
                        </th>
                    </tr>
                </thead>
                <tbody className="govuk-table__body">
                    <tr className="govuk-table__row">
                        <th scope="row" className="govuk-table__header">
                            _ga
                        </th>
                        <td className="govuk-table__cell">
                            These help us count how many people visit Fares Data Build Tool by tracking if you’ve
                            visited before
                        </td>
                        <td className="govuk-table__cell"> 2 years</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <th scope="row" className="govuk-table__header">
                            _gid
                        </th>
                        <td className="govuk-table__cell">
                            These help us count how many people visit Fares Data Build Tool by tracking if you’ve
                            visited before
                        </td>
                        <td className="govuk-table__cell"> 24 hours</td>
                    </tr>
                </tbody>
            </table>
            <h2 className="govuk-heading-m">Strictly necessary cookies</h2>
            <p className="govuk-body">
                When you use the Fares Data Build Tool we will set the following cookies as you progress through the
                forms. These cookies do not store your personal data and are deleted once you’ve completed the journey
            </p>
            <table className="govuk-table">
                <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header">
                            Name
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Purpose
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Expires
                        </th>
                    </tr>
                </thead>
                <tbody className="govuk-table__body">
                    <tr className="govuk-table__row">
                        <th scope="row" className="govuk-table__header">
                            fdbt-operator
                        </th>
                        <td className="govuk-table__cell">Set to remember the operator details</td>
                        <td className="govuk-table__cell">24 hours</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <th scope="row" className="govuk-table__header">
                            fdbt-refresh-token
                        </th>
                        <td className="govuk-table__cell">Set to store information for your logged in session</td>
                        <td className="govuk-table__cell">24 hours</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <th scope="row" className="govuk-table__header">
                            fdbt-id-token
                        </th>
                        <td className="govuk-table__cell">Set to store information for your logged in session</td>
                        <td className="govuk-table__cell">24 hours</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <th scope="row" className="govuk-table__header">
                            fdbt-user
                        </th>
                        <td className="govuk-table__cell">Set to store validation information for user</td>
                        <td className="govuk-table__cell">24 hours</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <th scope="row" className="govuk-table__header">
                            fdbt-reset-password
                        </th>
                        <td className="govuk-table__cell">
                            Set to store validation information when resetting password
                        </td>
                        <td className="govuk-table__cell">24 hours</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <th scope="row" className="govuk-table__header">
                            fdbt-cookies-policy
                        </th>
                        <td className="govuk-table__cell">
                            Set to store information for the agreement of the cookie policy
                        </td>
                        <td className="govuk-table__cell">24 hours</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <th scope="row" className="govuk-table__header">
                            fdbt-cookie-preferences-set
                        </th>
                        <td className="govuk-table__cell">
                            Set to store information on your selected cookie preferences
                        </td>
                        <td className="govuk-table__cell">24 hours</td>
                    </tr>
                </tbody>
            </table>
            <a
                href="/cookies"
                role="button"
                draggable="false"
                className="govuk-button"
                data-module="govuk-button"
                id="preference-button"
            >
                Preferences
            </a>
        </FullColumnLayout>
    );
};

export default Contact;
