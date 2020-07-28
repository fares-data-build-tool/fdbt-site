import {
    getSingleTicketJson,
    // getReturnTicketJson,
    // getPeriodGeoZoneTicketJson,
    // getPeriodMultipleServicesTicketJson,
    // getFlatFareTicketJson,
} from '../../../../src/pages/api/apiUtils/userData';
import {
    getMockRequestAndResponse,
    expectedMatchingJsonSingle,
    // expectedSingleProductUploadJsonWithZoneUpload,
    // expectedSingleProductUploadJsonWithSelectedServices,
    // expectedFlatFareProductUploadJson,
    userFareStages,
    mockBasicServiceSingleTicketJson,
    mockMatchingFaresZones,
} from '../../../testData/mockData';
import { MATCHING_ATTRIBUTE } from '../../../../src/constants';

// const writeHeadMock = jest.fn();

describe('getSingleTicketJson', () => {
    it.only('should return a SingleTicket object', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                'Adult - Weekly Rider - Cash, Card - OnBus, TicketMachine, Shop':
                    '{"name":"Adult - Weekly Rider - Cash, Card - OnBus, TicketMachine, Shop","description":"A Weekly Rider ticket for an adult that can bought using cash and card, on a bus and at a ticket machine or shop","purchaseLocations":"OnBus,TicketMachine,Shop","paymentMethods":"Cash,Card","ticketFormats":"Paper,Mobile"}',
            },
            session: {
                [MATCHING_ATTRIBUTE]: {
                    service: mockBasicServiceSingleTicketJson,
                    userFareStages,
                    matchingFareZones: mockMatchingFaresZones,
                },
            },
        });
        const result = getSingleTicketJson(req, res);
        console.log('result', result);
        console.log('expectedMatchingJsonSingle');
        expect(result).toEqual(expectedMatchingJsonSingle);
    });
});

// describe('getReturnTicketJson', () => {
//     it('should return a ReturnTicket object', () => {
//         const { req, res } = getMockRequestAndResponse({
//             cookieValues: {},
//             body: {},
//             uuid: {},
//             mockWriteHeadFn: writeHeadMock,
//         });
//         const result = getReturnTicketJson(req, res);
//         expect(result).toEqual(expectedMatchingJsonReturn);
//     });
// });

// describe('getPeriodGeoZoneTicketJson', () => {
//     it('should return a PeriodGeoZoneTicket object', () => {
//         const { req, res } = getMockRequestAndResponse({});
//         const result = getPeriodGeoZoneTicketJson(req, res);
//         expect(result).toEqual(expectedSingleProductUploadJsonWithZoneUpload);
//     });
// });

// describe('getPeriodMulipleServicesTicketJson', () => {
//     it('should return a string PeriodMultipleServicesTicket object', () => {
//         const { req, res } = getMockRequestAndResponse({
//             cookieValues: {},
//             body: {},
//             uuid: {},
//             mockWriteHeadFn: writeHeadMock,
//         });
//         const result = getPeriodMultipleServicesTicketJson(req, res);
//         expect(result).toEqual(expectedSingleProductUploadJsonWithSelectedServices);
//     });
// });

// describe('getFlatFareTicketJson', () => {
//     it('should return a string a FlatFareTicket object', () => {
//         const { req, res } = getMockRequestAndResponse({
//             cookieValues: {},
//             body: {},
//             uuid: {},
//             mockWriteHeadFn: writeHeadMock,
//         });
//         const result = getFlatFareTicketJson(req, res);
//         expect(result).toEqual(expectedFlatFareProductUploadJson);
//     });
// });
