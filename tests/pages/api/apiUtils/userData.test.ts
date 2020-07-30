import {
    getSingleTicketJson,
    getReturnTicketJson,
    getPeriodGeoZoneTicketJson,
    getPeriodMultipleServicesTicketJson,
    getFlatFareTicketJson,
    getSalesOfferPackagesFromRequestBody,
} from '../../../../src/pages/api/apiUtils/userData';
import {
    getMockRequestAndResponse,
    expectedMatchingJsonSingle,
    userFareStages,
    mockBasicServiceJson,
    mockMatchingFaresZones,
    expectedMatchingJsonReturnNonCircular,
    mockOutBoundMatchingFaresZones,
    expectedSingleProductUploadJsonWithZoneUpload,
    zoneStops,
    expectedSingleProductUploadJsonWithSelectedServices,
    expectedFlatFareProductUploadJson,
    expectedSalesOfferPackageArray,
    expectedMatchingJsonReturnCircular,
} from '../../../testData/mockData';
import * as s3 from '../../../../src/data/s3';
import * as auroradb from '../../../../src/data/auroradb';
import {
    MATCHING_ATTRIBUTE,
    INBOUND_MATCHING_ATTRIBUTE,
    PERIOD_EXPIRY_ATTRIBUTE,
    PRODUCT_DETAILS_ATTRIBUTE,
} from '../../../../src/constants';

describe('getSalesOfferPackagesFromRequestBody', () => {
    it('should return an array of SalesOfferPackage objects', () => {
        const reqBody = {
            'Adult - Weekly Rider - Cash, Card - OnBus, TicketMachine, Shop':
                '{"name":"Adult - Weekly Rider - Cash, Card - OnBus, TicketMachine, Shop","description":"A Weekly Rider ticket for an adult that can bought using cash and card, on a bus and at a ticket machine or shop","purchaseLocations":["OnBus","TicketMachine","Shop"],"paymentMethods":["Cash","Card"],"ticketFormats":["Paper","Mobile"]}',
            'Mobile Rider':
                '{"name":"Mobile Rider","description":"A ticket that can be purchased via a mobile.","purchaseLocations":["mobileDevice"],"paymentMethods":["debitCard"],"ticketFormats":["mobileApp"]}',
        };
        const result = getSalesOfferPackagesFromRequestBody(reqBody);
        expect(result).toEqual(expectedSalesOfferPackageArray);
    });
});

describe('getSingleTicketJson', () => {
    it('should return a SingleTicket object', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                'Adult - Weekly Rider - Cash, Card - OnBus, TicketMachine, Shop':
                    '{"name":"Adult - Weekly Rider - Cash, Card - OnBus, TicketMachine, Shop","description":"A Weekly Rider ticket for an adult that can bought using cash and card, on a bus and at a ticket machine or shop","purchaseLocations":["OnBus","TicketMachine","Shop"],"paymentMethods":["Cash","Card"],"ticketFormats":["Paper","Mobile"]}',
            },
            session: {
                [MATCHING_ATTRIBUTE]: {
                    service: mockBasicServiceJson,
                    userFareStages,
                    matchingFareZones: mockMatchingFaresZones,
                },
            },
        });
        const result = getSingleTicketJson(req, res);
        expect(result).toEqual(expectedMatchingJsonSingle);
    });
});

describe('getReturnTicketJson', () => {
    it('should return a ReturnTicket object for a non circular return journey', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: { fareType: 'return' },
            body: {
                'Adult - Weekly Rider - Cash, Card - OnBus, TicketMachine, Shop':
                    '{"name":"Adult - Weekly Rider - Cash, Card - OnBus, TicketMachine, Shop","description":"A Weekly Rider ticket for an adult that can bought using cash and card, on a bus and at a ticket machine or shop","purchaseLocations":["OnBus","TicketMachine","Shop"],"paymentMethods":["Cash","Card"],"ticketFormats":["Paper","Mobile"]}',
            },
            session: {
                [MATCHING_ATTRIBUTE]: {
                    service: mockBasicServiceJson,
                    userFareStages,
                    matchingFareZones: mockOutBoundMatchingFaresZones,
                },
                [INBOUND_MATCHING_ATTRIBUTE]: {
                    inboundUserFareStages: userFareStages,
                    inboundMatchingFareZones: mockMatchingFaresZones,
                },
            },
        });
        const result = getReturnTicketJson(req, res);
        expect(result).toEqual(expectedMatchingJsonReturnNonCircular);
    });
    it('should return a ReturnTicket object for a circular journey', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: { fareType: 'return' },
            body: {
                'Adult - Weekly Rider - Cash, Card - OnBus, TicketMachine, Shop':
                    '{"name":"Adult - Weekly Rider - Cash, Card - OnBus, TicketMachine, Shop","description":"A Weekly Rider ticket for an adult that can bought using cash and card, on a bus and at a ticket machine or shop","purchaseLocations":["OnBus","TicketMachine","Shop"],"paymentMethods":["Cash","Card"],"ticketFormats":["Paper","Mobile"]}',
            },
            session: {
                [MATCHING_ATTRIBUTE]: {
                    service: mockBasicServiceJson,
                    userFareStages,
                    matchingFareZones: mockMatchingFaresZones,
                },
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
        const { req, res } = getMockRequestAndResponse({
            cookieValues: { fareType: 'period' },
            body: {
                'Adult - Weekly Rider - Cash, Card - OnBus, TicketMachine, Shop':
                    '{"name":"Adult - Weekly Rider - Cash, Card - OnBus, TicketMachine, Shop","description":"A Weekly Rider ticket for an adult that can bought using cash and card, on a bus and at a ticket machine or shop","purchaseLocations":["OnBus","TicketMachine","Shop"],"paymentMethods":["Cash","Card"],"ticketFormats":["Paper","Mobile"]}',
            },
            session: {
                [PERIOD_EXPIRY_ATTRIBUTE]: {
                    products: [
                        {
                            productName: 'Product A',
                            productPrice: '1234',
                            productDuration: '2',
                            productValidity: '24hr',
                        },
                    ],
                },
            },
        });
        batchGetStopsByAtcoCodeSpy.mockImplementation(() => Promise.resolve(zoneStops));
        const result = await getPeriodGeoZoneTicketJson(req, res);
        expect(result).toEqual(expectedSingleProductUploadJsonWithZoneUpload);
    });
});

describe('getPeriodMulipleServicesTicketJson', () => {
    it('should return a string PeriodMultipleServicesTicket object', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: { fareType: 'period' },
            body: {
                'Adult - Weekly Rider - Cash, Card - OnBus, TicketMachine, Shop':
                    '{"name":"Adult - Weekly Rider - Cash, Card - OnBus, TicketMachine, Shop","description":"A Weekly Rider ticket for an adult that can bought using cash and card, on a bus and at a ticket machine or shop","purchaseLocations":["OnBus","TicketMachine","Shop"],"paymentMethods":["Cash","Card"],"ticketFormats":["Paper","Mobile"]}',
            },
            session: {
                [PERIOD_EXPIRY_ATTRIBUTE]: {
                    products: [
                        {
                            productName: 'Product A',
                            productPrice: '1234',
                            productDuration: '2',
                            productValidity: '24hr',
                        },
                    ],
                },
            },
        });
        const result = getPeriodMultipleServicesTicketJson(req, res);
        expect(result).toEqual(expectedSingleProductUploadJsonWithSelectedServices);
    });
});

describe('getFlatFareTicketJson', () => {
    it('should return a string a FlatFareTicket object', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: { fareType: 'flatFare' },
            body: {
                'Adult - Weekly Rider - Cash, Card - OnBus, TicketMachine, Shop':
                    '{"name":"Adult - Weekly Rider - Cash, Card - OnBus, TicketMachine, Shop","description":"A Weekly Rider ticket for an adult that can bought using cash and card, on a bus and at a ticket machine or shop","purchaseLocations":["OnBus","TicketMachine","Shop"],"paymentMethods":["Cash","Card"],"ticketFormats":["Paper","Mobile"]}',
            },
            session: {
                [PRODUCT_DETAILS_ATTRIBUTE]: {
                    products: [
                        {
                            productName: 'Weekly Rider',
                            productPrice: '7',
                        },
                    ],
                },
            },
        });
        const result = getFlatFareTicketJson(req, res);
        expect(result).toEqual(expectedFlatFareProductUploadJson);
    });
});
