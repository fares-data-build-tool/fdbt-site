import React, { ReactElement } from 'react';
import { TwoThirdsLayout } from '../layout/Layout';

const title = 'Accessibility - Fares Data Build Tool';
const description = 'Accessibility page for the Fares Data Build Tool';

const Accessibility = (): ReactElement => {
    return (
        <TwoThirdsLayout title={title} description={description}>
            <h1 className="govuk-heading-l">Accessibility statement for Fares Data Build Tool</h1>
            <p className="govuk-body">
                This service is part of the wider GOV.UK website. There’s a separate accessibility statement for the
                main GOV.UK website.
            </p>
            <p className="govuk-body">
                This page only contains information about the Fares Data Build Tool service, available at
                https://fares-data.dft.gov.uk
            </p>
            <h3 className="govuk-heading-s">Using this service</h3>
            <p className="govuk-body">
                This service is run by Government Digital Service. We want as many people as possible to be able to use
                this service. For example, that means you should be able to:
            </p>
            <ol className="govuk-list govuk-list--bullet">
                <li>change colours, contrast levels and fonts</li>
                <li>zoom in up to 300% without the text spilling off the screen</li>
                <li>get from the start of the service to the end using just a keyboard</li>
                <li>get from the start of the service to the end using speech recognition software</li>
                <li>
                    listen to the service using a screen reader (including the most recent versions of JAWS, NVDA and
                    VoiceOver)
                </li>
            </ol>
            <p className="govuk-body">We’ve also made the text in the service as simple as possible to understand.</p>

            <p className="govuk-body">
                <a href="https://mcmw.abilitynet.org.uk/" rel="external">
                    AbilityNet
                </a>
                &nbsp;has advice on making your device easier to use if you have a disability.
            </p>
            <h3 className="govuk-heading-s">Feedback and contact information</h3>
            <p className="govuk-body">If you have difficulty using this service, contact us by:</p>
            <ol className="govuk-list govuk-list--bullet">
                <li>
                    email <a href="mailto:fdbt-support@infinityworks.com">fdbt-support@infinityworks.com</a>
                </li>
                <li>call 0800 464 3290</li>
            </ol>
            <p className="govuk-body">
                As part of providing this service, we may need to send you messages or documents. We’ll ask you how you
                want us to send messages or documents to you, but contact us if you need them in a different format. For
                example large print, audio recording or braille.
            </p>
            <h3 className="govuk-heading-s">Reporting accessibility problems with this service</h3>
            <p className="govuk-body">
                We’re always looking to improve the accessibility of this service. If you find any problems that are not
                listed on this page or think we’re not meeting accessibility requirements,
                <a href="/contact">contact us</a>
            </p>
            <h3 className="govuk-heading-s">Enforcement procedure</h3>
            <p className="govuk-body">
                The Equality and Human Rights Commission (EHRC) is responsible for enforcing the Public Sector Bodies
                (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018 (the ‘accessibility
                regulations’). If you’re not happy with how we respond to your complaint,
                <a href="https://www.equalityadvisoryservice.com/">
                    contact the Equality Advisory and Support Service (EASS)
                </a>
                .
            </p>
            <h3 className="govuk-heading-s">Contacting us by phone or visiting us in person</h3>
            <p className="govuk-body">
                We provide a text relay service for people who are deaf, hearing impaired or have a speech impediment.
            </p>
            <p className="govuk-body">
                Our offices have audio induction loops, or if you contact us before your visit we can arrange a British
                Sign Language (BSL) interpreter to help you complete the service in person.
            </p>
            <p className="govuk-body">
                Find out how to <a href="/contact">contact us</a>.
            </p>
            <h3 className="govuk-heading-s">Technical information about this website’s accessibility</h3>
            <p className="govuk-body">
                The Government Digital Service is committed to making its websites accessible, in accordance with the
                Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018.
            </p>
            <h3 className="govuk-heading-s">Compliance status</h3>
            <p className="govuk-body">
                This service is fully compliant with the&nbsp;
                <a href="https://www.w3.org/TR/WCAG21/">Web Content Accessibility Guidelines version 2.1 AA standard</a>
                .
            </p>
            <h3 className="govuk-heading-s"> Preparation of this accessibility statement</h3>
            <p className="govuk-body">
                This statement was prepared on 20 October 2020. It was last reviewed on 20 October 2020.
            </p>
            <p className="govuk-body">
                This website was last tested on 7 October 2020. The test was carried out by Digital Accessibility
                Centre.
            </p>
        </TwoThirdsLayout>
    );
};

export default Accessibility;
