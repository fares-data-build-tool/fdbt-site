import {
    PASSENGER_TYPE_COOKIE,
    FARE_TYPE_COOKIE,
    INPUT_METHOD_COOKIE,
    JOURNEY_COOKIE,
    PERIOD_TYPE_COOKIE,
    NUMBER_OF_PRODUCTS_COOKIE,
    TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE,
} from '../constants/index';
import { Breadcrumb, NextPageContextWithSession } from '../interfaces';
import { getCookieValue } from '.';
import { getSessionAttribute } from './sessions';

export default (ctx: NextPageContextWithSession): { generate: () => Breadcrumb[] } => {
    const url = ctx.req?.url;

    if (!url || url === '/' || url === '/home') {
        return {
            generate: (): Breadcrumb[] => [],
        };
    }

    const fareType = getCookieValue(ctx, FARE_TYPE_COOKIE, 'fareType');
    const outboundJourney = getCookieValue(ctx, JOURNEY_COOKIE, 'outboundJourney');
    const inputMethod = getCookieValue(ctx, INPUT_METHOD_COOKIE, 'inputMethod');
    const periodType = getCookieValue(ctx, PERIOD_TYPE_COOKIE, 'periodTypeName');
    const passengerType = getCookieValue(ctx, PASSENGER_TYPE_COOKIE, 'passengerType');
    const numberOfProducts = getCookieValue(ctx, NUMBER_OF_PRODUCTS_COOKIE, 'numberOfProductsInput');

    const timeRestriction = getSessionAttribute(ctx.req, TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE);

    const csvUploadUrls = ['/csvUpload'];
    const manualUploadUrls = ['/howManyStages', '/chooseStages', '/stageNames', '/priceEntry'];
    const singleProductUrls = ['/productDetails', '/chooseValidity', '/periodValidity'];
    const multiProductUrls = ['/multipleProducts', '/multipleProductValidity'];
    const salesOfferPackagesUrls = ['/selectSalesOfferPackage', '/salesOfferPackages', '/describeSalesOfferPackage'];

    const isSingle = fareType === 'single';
    const isReturn = fareType === 'return';
    const isPeriod = fareType === 'period';
    const isFlatFare = fareType === 'flatFare';
    const isMultiService = periodType === 'periodMultipleServices';
    const isGeoZone = periodType === 'periodGeoZone';
    const isCircular = isReturn && !outboundJourney;

    const isSingleProduct = singleProductUrls.includes(url) || numberOfProducts === '1';
    const isMultiProduct = multiProductUrls.includes(url) || (numberOfProducts !== null && numberOfProducts !== '1');

    const isCsvUploadUrl = csvUploadUrls.includes(url);
    const isManualUploadUrl = manualUploadUrls.includes(url);
    const isSalesOfferPackageUrl = salesOfferPackagesUrls.includes(url);
    const isCsvUploadCookie = !isCsvUploadUrl && !isManualUploadUrl && inputMethod === 'csv';
    const isManualUploadCookie = !isCsvUploadUrl && !isManualUploadUrl && inputMethod === 'manual';
    const isCsvUploadJourney = isCsvUploadUrl || isCsvUploadCookie;
    const isManualUploadJourney = isManualUploadUrl || isManualUploadCookie;

    const getSingleAndReturnBreadcrumbs = (): Breadcrumb[] => [
        {
            name: 'Service',
            link: '/service',
            show: isSingle || isReturn,
        },
        {
            name: 'Direction',
            link: '/singleDirection',
            show: isSingle,
        },
        {
            name: 'Direction',
            link: '/returnDirection',
            show: isReturn,
        },
        {
            name: 'Input method',
            link: '/inputMethod',
            show: isSingle || isReturn,
        },
        {
            name: 'Upload CSV',
            link: '/csvUpload',
            show: isCsvUploadJourney,
        },
        {
            name: 'Stage count check',
            link: '/howManyStages',
            show: isManualUploadJourney,
        },
        {
            name: 'Number of stages',
            link: '/chooseStages',
            show: isManualUploadJourney,
        },
        {
            name: 'Stage names',
            link: '/stageNames',
            show: isManualUploadJourney,
        },
        {
            name: 'Stage prices',
            link: '/priceEntry',
            show: isManualUploadJourney,
        },
        {
            name: 'Match stops',
            link: '/matching',
            show: isSingle || isCircular,
        },
        {
            name: 'Outbound stops',
            link: '/outboundMatching',
            show: isReturn && !isCircular,
        },
        {
            name: 'Inbound stops',
            link: '/inboundMatching',
            show: isReturn && !isCircular,
        },
    ];

    const getPeriodAndFlatFareBreadcrumbs = (): Breadcrumb[] => [
        {
            name: 'Period type',
            link: '/periodType',
            show: isPeriod,
        },
        {
            name: 'Services',
            link: '/serviceList',
            show: isMultiService || isFlatFare,
        },
        {
            name: 'Upload CSV',
            link: '/csvZoneUpload',
            show: isGeoZone,
        },
        {
            name: 'Number of products',
            link: '/howManyProducts',
            show: isMultiService || isGeoZone,
        },
        {
            name: 'Product details',
            link: '/productDetails',
            show: isFlatFare || isSingleProduct,
        },
        {
            name: 'Days valid',
            link: '/chooseValidity',
            show: isSingleProduct,
        },
        {
            name: 'Product period validity',
            link: '/periodValidity',
            show: isSingleProduct,
        },
        {
            name: 'Product details',
            link: '/multipleProducts',
            show: isMultiProduct,
        },
        {
            name: 'Product period validity',
            link: '/multipleProductValidity',
            show: isMultiProduct,
        },
    ];

    const getSalesOfferPackageBreadcrumbs = (): Breadcrumb[] => [
        {
            name: 'Select sales offer packages',
            link: '/selectSalesOfferPackage',
            show: isSalesOfferPackageUrl,
        },
        {
            name: 'Define sales offer package',
            link: '/salesOfferPackages',
            show: isSalesOfferPackageUrl,
        },
        {
            name: 'Describe sales offer package',
            link: '/describeSalesOfferPackage',
            show: isSalesOfferPackageUrl,
        },
    ];

    const getFullBreadcrumbList = (): Breadcrumb[] => {
        const isNotAnyonePassengerType = passengerType !== 'anyone';
        const isTimeRestrictionDefined = !!timeRestriction;

        const breadcrumbList: Breadcrumb[] = [
            {
                name: 'Home',
                link: '/home',
                show: true,
            },
            {
                name: 'Fare type',
                link: '/fareType',
                show: true,
            },
            {
                name: 'Passenger type',
                link: '/passengerType',
                show: true,
            },
            {
                name: 'Passenger type details',
                link: '/definePassengerType',
                show: isNotAnyonePassengerType,
            },
            {
                name: 'Time restrictions',
                link: '/timeRestrictions',
                show: true,
            },
            {
                name: 'Time restrictions details',
                link: '/defineTimeRestrictions',
                show: isTimeRestrictionDefined,
            },
        ];

        if (isSingle || isReturn) {
            breadcrumbList.push(...getSingleAndReturnBreadcrumbs());
        }

        if (isPeriod || isFlatFare) {
            breadcrumbList.push(...getPeriodAndFlatFareBreadcrumbs());
        }

        breadcrumbList.push(...getSalesOfferPackageBreadcrumbs());

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
