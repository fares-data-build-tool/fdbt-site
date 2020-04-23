import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import { parseCookies } from 'nookies';
import Layout from '../layout/Layout';
import { OPERATOR_COOKIE, SERVICE_COOKIE, JOURNEY_COOKIE, FARETYPE_COOKIE } from '../constants';
import { deleteCookieOnServerSide, getUuidFromCookies, setCookieOnServerSide } from '../utils';
import {
    getServiceByNocCodeAndLineName,
    Service,
    RawService,
} from '../data/auroradb';
import { redirectTo } from './api/apiUtils';
import DirectionDropdown from '../components/DirectionDropdown';
import { enrichJourneyPatternsWithNaptanInfo } from './direction';

const title = 'Journey Selection - Fares data build tool';
const description = 'Inbound and Outbound journey selection page of the Fares data build tool';

interface DirectionProps {
    service: Service;
}

const SelectJourneyDirection = ({ service }: DirectionProps): ReactElement => {
    return (
        <Layout title={title} description={description}>
            <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
                <form action="/api/direction" method="post">
                    <div className="govuk-form-group">
                        <fieldset className="govuk-fieldset" aria-describedby="page-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                <h1 className="govuk-fieldset__heading" id="page-heading">
                                    Please select your journey direction
                                </h1>
                            </legend>
                            <div className="govuk-!-margin-top-5">
                                <span className="govuk-hint" id="journey-selection-hint">
                                    Outbound Journey
                                </span>
                                <DirectionDropdown journeyPatterns={service.journeyPatterns} />
                            </div>
                            <div className="govuk-!-margin-top-6">
                                <span className="govuk-hint" id="journey-selection-hint">
                                    Inbound Journey
                                </span>
                                <DirectionDropdown journeyPatterns={service.journeyPatterns} />
                            </div>
                        </fieldset>
                    </div>
                    <input
                        type="submit"
                        value="Continue"
                        id="continue-button"
                        className="govuk-button govuk-button--start"
                    />
                </form>
            </main>
        </Layout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{}> => {
    deleteCookieOnServerSide(ctx, JOURNEY_COOKIE);
    const cookies = parseCookies(ctx);
    const operatorCookie = cookies[OPERATOR_COOKIE];
    const serviceCookie = cookies[SERVICE_COOKIE];
    const fareTypeCookie = cookies[FARETYPE_COOKIE];

    if (!operatorCookie || !serviceCookie || !fareTypeCookie) {
        throw new Error('Necessary cookies not found to show direction page');
    }

    const operatorInfo = JSON.parse(operatorCookie);
    const serviceInfo = JSON.parse(serviceCookie);
    const fareTypeInfo = JSON.parse(fareTypeCookie);

    const lineName = serviceInfo.service.split('#')[0];

    const rawService: RawService = await getServiceByNocCodeAndLineName(operatorInfo.nocCode, lineName);
    const service: Service = {
        ...rawService,
        journeyPatterns: await enrichJourneyPatternsWithNaptanInfo(rawService.journeyPatterns),
    };

    if (!service) {
        throw new Error(
            `No service info could be retrieved for nocCode: ${operatorInfo.nocCode} and lineName: ${lineName}`,
        );
    }

    // Remove journeys with duplicate start and end points for display purposes
    service.journeyPatterns = service.journeyPatterns.filter(
        (pattern, index, self) =>
            self.findIndex(
                item => item.endPoint.Id === pattern.endPoint.Id && item.startPoint.Id === pattern.startPoint.Id,
            ) === index,
    );

    // Redirect to inputMethod page if there is only one journeyPattern (i.e. circular journey)
    if (service.journeyPatterns.length === 1 && fareTypeInfo.fareType === 'returnSingle') {
        if (ctx.res) {
            const uuid = getUuidFromCookies(ctx);
            const journeyPatternCookie = `${service.journeyPatterns[0].startPoint.Id}#${service.journeyPatterns[0].endPoint.Id}`;
            const cookieValue = JSON.stringify({ journeyPattern: journeyPatternCookie, uuid });
            setCookieOnServerSide(ctx, JOURNEY_COOKIE, cookieValue);
            redirectTo(ctx.res, '/inputMethod');
        }
    }

    return { props: { operator: operatorInfo.operator, lineName, service } };
};

export default SelectJourneyDirection;
