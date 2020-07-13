import {
    PASSENGER_TYPE_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
    INPUT_METHOD_ATTRIBUTE,
    JOURNEY_COOKIE,
    PERIOD_TYPE_ATTRIBUTE,
} from '../constants/index';
import { Breadcrumb, NextPageContextWithSession } from '../interfaces';
import { getCookieValue } from '.';
import { getSessionAttribute } from './sessions';

export default (ctx: NextPageContextWithSession): { generate: () => Breadcrumb[] } => {
    const url = ctx.req?.url;

    if (!url || url === '/') {
        return {
            generate: (): Breadcrumb[] => [],
        };
    }

    const fareType = getSessionAttribute(ctx.req, FARE_TYPE_ATTRIBUTE);
    const passengerType = getSessionAttribute(ctx.req, PASSENGER_TYPE_ATTRIBUTE);
    const outboundJourney = getCookieValue(ctx, JOURNEY_COOKIE, 'outboundJourney');
    const inputMethod = getCookieValue(ctx, INPUT_METHOD_ATTRIBUTE, 'inputMethod');
    const periodType = getSessionAttribute(ctx.req, PERIOD_TYPE_ATTRIBUTE);

    const csvUploadUrls = ['/csvUpload'];
    const manualUploadUrls = ['/howManyStages', '/chooseStages', '/stageNames', '/priceEntry'];
    const singleProductUrls = ['/productDetails', '/chooseValidity', '/periodValidity'];
    const multiProductUrls = ['/multipleProducts', '/multipleProductValidity'];

    const isSingle = fareType === 'single';
    const isReturn = fareType === 'return';
    const isPeriod = fareType === 'period';
    const isFlatFare = fareType === 'flatFare';
    const isMultiService = periodType === 'periodMultipleServices';
    const isGeoZone = periodType === 'periodGeoZone';
    const isCircular = isReturn && !outboundJourney;

    const isSingleProduct = singleProductUrls.includes(url);
    const isMultiProduct = multiProductUrls.includes(url);

    const isCsvUploadUrl = csvUploadUrls.includes(url);
    const isManualUploadUrl = manualUploadUrls.includes(url);
    const isCsvUploadCookie = !isCsvUploadUrl && !isManualUploadUrl && inputMethod === 'csv';
    const isManualUploadCookie = !isCsvUploadUrl && !isManualUploadUrl && inputMethod === 'manual';
    const isCsvUploadJourney = isCsvUploadUrl || isCsvUploadCookie;
    const isManualUploadJourney = isManualUploadUrl || isManualUploadCookie;

    const getSingleAndReturnBreadcrumbs = (): Breadcrumb[] => [
        {
            name: 'Select Service',
            link: '/service',
            show: isSingle || isReturn,
        },
        {
            name: 'Select Direction',
            link: '/singleDirection',
            show: isSingle,
        },
        {
            name: 'Select Direction',
            link: '/returnDirection',
            show: isReturn,
        },
        {
            name: 'Select Input Method',
            link: '/inputMethod',
            show: isSingle || isReturn,
        },
        {
            name: 'Upload Fares Triangle CSV',
            link: '/csvUpload',
            show: isCsvUploadJourney,
        },
        {
            name: 'Stage Count Check',
            link: '/howManyStages',
            show: isManualUploadJourney,
        },
        {
            name: 'Enter Number of Stages',
            link: '/chooseStages',
            show: isManualUploadJourney,
        },
        {
            name: 'Enter Stage Names',
            link: '/stageNames',
            show: isManualUploadJourney,
        },
        {
            name: 'Enter Stage Prices',
            link: '/priceEntry',
            show: isManualUploadJourney,
        },
        {
            name: 'Match Stops',
            link: '/matching',
            show: isSingle || isCircular,
        },
        {
            name: 'Match Outbound Stops',
            link: '/outboundMatching',
            show: isReturn && !isCircular,
        },
        {
            name: 'Match Inbound Stops',
            link: '/inboundMatching',
            show: isReturn && !isCircular,
        },
    ];

    const getPeriodAndFlatFareBreadcrumbs = (): Breadcrumb[] => [
        {
            name: 'Select Period Type',
            link: '/periodType',
            show: isPeriod,
        },
        {
            name: 'Select Services',
            link: '/serviceList',
            show: isMultiService || isFlatFare,
        },
        {
            name: 'Upload Zone CSV',
            link: '/csvZoneUpload',
            show: isGeoZone,
        },
        {
            name: 'Enter Number of Products',
            link: '/howManyProducts',
            show: isMultiService || isGeoZone,
        },
        {
            name: 'Enter Product Details',
            link: '/productDetails',
            show: isFlatFare || isSingleProduct,
        },
        {
            name: 'Enter Days Valid',
            link: '/chooseValidity',
            show: isSingleProduct,
        },
        {
            name: 'Select Product Period Validity',
            link: '/periodValidity',
            show: isSingleProduct,
        },
        {
            name: 'Enter Product Details',
            link: '/multipleProducts',
            show: isMultiProduct,
        },
        {
            name: 'Select Product Period Validity',
            link: '/multipleProductValidity',
            show: isMultiProduct,
        },
    ];

    const getFullBreadcrumbList = (): Breadcrumb[] => {
        const isNotAnyonePassengerType = passengerType !== 'anyone';

        const breadcrumbList: Breadcrumb[] = [
            {
                name: 'Home',
                link: '/home',
                show: true,
            },
            {
                name: 'Select Fare Type',
                link: '/fareType',
                show: true,
            },
            {
                name: 'Select Passenger Type',
                link: '/passengerType',
                show: true,
            },
            {
                name: 'Enter Passenger Type Details',
                link: '/definePassengerType',
                show: isNotAnyonePassengerType,
            },
        ];

        if (isSingle || isReturn) {
            breadcrumbList.push(...getSingleAndReturnBreadcrumbs());
        }

        if (isPeriod || isFlatFare) {
            breadcrumbList.push(...getPeriodAndFlatFareBreadcrumbs());
        }

        return breadcrumbList;
    };

    const generate = (): Breadcrumb[] => {
        const fullBreadcrumbList = getFullBreadcrumbList();
        const index = fullBreadcrumbList.findIndex(item => item.link === url.split('?')[0] && item.show);
        const breadcrumbsToShow = fullBreadcrumbList.slice(0, index + 1).filter(item => item.show);

        return breadcrumbsToShow;
    };

    return {
        generate,
    };
};
