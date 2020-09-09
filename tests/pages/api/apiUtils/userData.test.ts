import {
    SALES_OFFER_PACKAGES_ATTRIBUTE,
    MATCHING_ATTRIBUTE,
    INBOUND_MATCHING_ATTRIBUTE,
    PRODUCT_DETAILS_ATTRIBUTE,
    TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
    FARE_ZONE_ATTRIBUTE,
    MULTIPLE_PRODUCT_ATTRIBUTE,
} from '../../../../src/constants/index';
import {
    defaultSalesOfferPackageOne,
    defaultSalesOfferPackageTwo,
} from '../../../../src/pages/selectSalesOfferPackage';
import {
    getSingleTicketJson,
    getReturnTicketJson,
    getPeriodGeoZoneTicketJson,
    getPeriodMultipleServicesTicketJson,
    getFlatFareTicketJson,
    getProductsAndSalesOfferPackages,
} from '../../../../src/pages/api/apiUtils/userData';
import {
    getMockRequestAndResponse,
    expectedMatchingJsonSingle,
    userFareStages,
    service,
    mockMatchingFaresZones,
    expectedMatchingJsonReturnNonCircular,
    mockOutBoundMatchingFaresZones,
    expectedSingleProductUploadJsonWithZoneUpload,
    zoneStops,
    expectedFlatFareProductUploadJson,
    expectedMatchingJsonReturnCircular,
    expectedProductDetailsArray,
    expectedMultiProductUploadJsonWithSelectedServices,
    mockTimeRestriction,
} from '../../../testData/mockData';
import * as s3 from '../../../../src/data/s3';
import * as auroradb from '../../../../src/data/auroradb';

import { FareZone } from '../../../../src/pages/api/csvZoneUpload';
import { MultipleProductAttribute } from '../../../../src/pages/api/multipleProductValidity';

describe('getProductsAndSalesOfferPackages', () => {
    it('should return an array of ProductDetails objects', () => {
        const multipleProductAttribute: MultipleProductAttribute = {
            products: [
                { productName: 'Product', productPrice: '2.99', productDuration: '1', productValidity: '24hr' },
                { productName: 'Product Two', productPrice: '7.99', productDuration: '7', productValidity: '24hr' },
            ],
        };
        const productSops = [
            {
                productName: 'Product',
                salesOfferPackages: [defaultSalesOfferPackageOne, defaultSalesOfferPackageTwo],
            },
            {
                productName: 'Product Two',
                salesOfferPackages: [defaultSalesOfferPackageTwo],
            },
        ];
        const result = getProductsAndSalesOfferPackages(productSops, multipleProductAttribute);
        expect(result).toEqual(expectedProductDetailsArray);
    });
});

describe('getSingleTicketJson', () => {
    it('should return a SingleTicket object', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            session: {
                [MATCHING_ATTRIBUTE]: {
                    service,
                    userFareStages,
                    matchingFareZones: mockMatchingFaresZones,
                },
                [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                [FARE_TYPE_ATTRIBUTE]: { fareType: 'single' },
            },
        });
        const result = getSingleTicketJson(req, res);
        expect(result).toEqual(expectedMatchingJsonSingle);
    });
});

describe('getReturnTicketJson', () => {
    it('should return a ReturnTicket object for a non circular return journey', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            session: {
                [MATCHING_ATTRIBUTE]: {
                    service,
                    userFareStages,
                    matchingFareZones: mockOutBoundMatchingFaresZones,
                },
                [INBOUND_MATCHING_ATTRIBUTE]: {
                    inboundUserFareStages: userFareStages,
                    inboundMatchingFareZones: mockMatchingFaresZones,
                },
                [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                [FARE_TYPE_ATTRIBUTE]: { fareType: 'return' },
            },
        });
        const result = getReturnTicketJson(req, res);
        expect(result).toEqual(expectedMatchingJsonReturnNonCircular);
    });
    it('should return a ReturnTicket object for a circular journey', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {},
            session: {
                [MATCHING_ATTRIBUTE]: {
                    service,
                    userFareStages,
                    matchingFareZones: mockMatchingFaresZones,
                },
                [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                [FARE_TYPE_ATTRIBUTE]: { fareType: 'return' },
            },
        });
        const result = getReturnTicketJson(req, res);
        expect(result).toEqual(expectedMatchingJsonReturnCircular);
    });
});

describe('getPeriodGeoZoneTicketJson', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    const atcoCodes: string[] = ['13003305E', '13003622B', '13003655B'];
    let batchGetStopsByAtcoCodeSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.spyOn(s3, 'getCsvZoneUploadData').mockImplementation(() => Promise.resolve(atcoCodes));

        batchGetStopsByAtcoCodeSpy = jest.spyOn(auroradb, 'batchGetStopsByAtcoCode');
    });

    it('should return a PeriodGeoZoneTicket object', async () => {
        const mockFareZoneAttribute: FareZone = { fareZoneName: 'Green Lane Shops' };
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {},
            session: {
                [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                [FARE_TYPE_ATTRIBUTE]: { fareType: 'period' },
                [FARE_ZONE_ATTRIBUTE]: mockFareZoneAttribute,
                [MULTIPLE_PRODUCT_ATTRIBUTE]: {
                    products: [
                        {
                            productName: 'Product A',
                            productPrice: '1234',
                            productDuration: '2',
                            productValidity: '24hr',
                        },
                    ],
                },
                [SALES_OFFER_PACKAGES_ATTRIBUTE]: [
                    {
                        productName: 'Product A',
                        salesOfferPackages: [defaultSalesOfferPackageOne, defaultSalesOfferPackageTwo],
                    },
                ],
            },
        });
        batchGetStopsByAtcoCodeSpy.mockImplementation(() => Promise.resolve(zoneStops));
        const result = await getPeriodGeoZoneTicketJson(req, res);
        expect(result).toEqual(expectedSingleProductUploadJsonWithZoneUpload);
    });
});

describe('getPeriodMulipleServicesTicketJson', () => {
    it('should return a PeriodMultipleServicesTicket object', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {},
            session: {
                [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                [FARE_TYPE_ATTRIBUTE]: { fareType: 'period' },
                [MULTIPLE_PRODUCT_ATTRIBUTE]: {
                    products: [
                        {
                            productName: 'Weekly Ticket',
                            productPrice: '50',
                            productDuration: '5',
                            productValidity: '24hr',
                        },
                        {
                            productName: 'Day Ticket',
                            productPrice: '2.50',
                            productDuration: '1',
                            productValidity: '24hr',
                        },
                        {
                            productName: 'Monthly Ticket',
                            productPrice: '200',
                            productDuration: '28',
                            productValidity: 'endOfCalendarDay',
                        },
                    ],
                },
                [SALES_OFFER_PACKAGES_ATTRIBUTE]: [
                    {
                        productName: 'Weekly Ticket',
                        salesOfferPackages: [defaultSalesOfferPackageOne, defaultSalesOfferPackageTwo],
                    },
                    {
                        productName: 'Day Ticket',
                        salesOfferPackages: [defaultSalesOfferPackageOne, defaultSalesOfferPackageTwo],
                    },
                    {
                        productName: 'Monthly Ticket',
                        salesOfferPackages: [defaultSalesOfferPackageOne, defaultSalesOfferPackageTwo],
                    },
                ],
            },
        });
        const result = getPeriodMultipleServicesTicketJson(req, res);
        expect(result).toEqual(expectedMultiProductUploadJsonWithSelectedServices);
    });
});

describe('getFlatFareTicketJson', () => {
    it('should return a string a FlatFareTicket object', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            session: {
                [PRODUCT_DETAILS_ATTRIBUTE]: {
                    products: [
                        {
                            productName: 'Weekly Rider',
                            productPrice: '7',
                        },
                    ],
                },
                [FARE_TYPE_ATTRIBUTE]: { fareType: 'flatFare' },
            },
        });
        const result = getFlatFareTicketJson(req, res);
        expect(result).toEqual(expectedFlatFareProductUploadJson);
    });
});
