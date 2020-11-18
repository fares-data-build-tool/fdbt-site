import * as React from 'react';
import { shallow } from 'enzyme';
import TicketConfirmation, {
    buildFlatFareTicketConfirmationElements,
    buildMatchedFareStages,
    buildPeriodOrMultiOpTicketConfirmationElements,
    buildReturnTicketConfirmationElements,
    buildSchoolTicketConfirmationElements,
    buildSingleTicketConfirmationElements,
    buildTicketConfirmationElements,
    getServerSideProps,
    MatchedFareStages,
    TicketConfirmationProps,
} from '../../src/pages/ticketConfirmation';
import * as ticketConfirmation from '../../src/pages/ticketConfirmation';
import { MatchingFareZones } from '../../src/interfaces/matchingInterface';
import { getMockContext, mockMatchingFaresZones, mockOutboundMatchingFaresZones } from '../testData/mockData';
import { ConfirmationElement } from '../../src/components/ConfirmationTable';
import { FARE_TYPE_ATTRIBUTE, SCHOOL_FARE_TYPE_ATTRIBUTE } from '../../src/constants';

// NEED TO REFACTOR TESTS TO TEST THE BELOW:
// (a) each of  (i) buildSingleTicketConfirmationElements()
//              (ii) buildReturnTicketConfirmationElements()
//              (iii) buildPeriodOrMultiOpTicketConfirmationElements()
//              (iv) buildFlatFareTicketConfirmationElements()
// (b) each of  (i) buildTicketConfirmationElements()
//              (ii) buildSchoolTicketConfirmationElements()
// (c) getServerSideProps
// (d) render of each different ticket type

describe('pages', () => {
    describe('ticketConfirmation', () => {
        // describe('buildMatchedFareStages', () => {
        //     it('should return matched fare stages for a selection of matching fare zones', () => {
        //         const mockMatchingFareZones: MatchingFareZones = {};
        //         const mockMatchedFareStages: MatchedFareStages[] = [];
        //         const matchedFareStages = buildMatchedFareStages(mockMatchingFareZones);
        //         expect(matchedFareStages).toEqual(mockMatchedFareStages);
        //     });
        // });

        // describe('buildSingleTicketConfirmationElements', () => {
        //     it('should return an array of confirmation elements for a single ticket', () => {
        //         const ctx = getMockContext();
        //         const expectedConfirmationElements: ConfirmationElement[] = [];
        //         const confirmationElements = buildSingleTicketConfirmationElements(ctx);
        //         expect(confirmationElements).toEqual(expectedConfirmationElements);
        //     });
        // });

        // describe('buildReturnTicketConfirmationElements', () => {
        //     it('should return an array of confirmation elements for a return non-circular ticket', () => {
        //         const ctx = getMockContext();
        //         const expectedConfirmationElements: ConfirmationElement[] = [];
        //         const confirmationElements = buildSingleTicketConfirmationElements(ctx);
        //         expect(confirmationElements).toEqual(expectedConfirmationElements);
        //     });

        //     it('should return an array of confirmation elements for a return circular ticket', () => {
        //         const ctx = getMockContext();
        //         const expectedConfirmationElements: ConfirmationElement[] = [];
        //         const confirmationElements = buildSingleTicketConfirmationElements(ctx);
        //         expect(confirmationElements).toEqual(expectedConfirmationElements);
        //     });
        // });

        // describe('buildPeriodOrMultiOpTicketConfirmationElements', () => {
        //     it('should return an array of confirmation elements for a period geo zone ticket', () => {
        //         const ctx = getMockContext();
        //         const expectedConfirmationElements: ConfirmationElement[] = [];
        //         const confirmationElements = buildSingleTicketConfirmationElements(ctx);
        //         expect(confirmationElements).toEqual(expectedConfirmationElements);
        //     });

        //     it('should return an array of confirmation elements for a period multi services ticket', () => {
        //         const ctx = getMockContext();
        //         const expectedConfirmationElements: ConfirmationElement[] = [];
        //         const confirmationElements = buildSingleTicketConfirmationElements(ctx);
        //         expect(confirmationElements).toEqual(expectedConfirmationElements);
        //     });
        // });

        // describe('buildFlatFareTicketConfirmationElements', () => {
        //     it('should return an array of confirmation elements for a flat fare ticket', () => {
        //         const ctx = getMockContext();
        //         const expectedConfirmationElements: ConfirmationElement[] = [];
        //         const confirmationElements = buildSingleTicketConfirmationElements(ctx);
        //         expect(confirmationElements).toEqual(expectedConfirmationElements);
        //     });
        // });

        // describe('buildSchoolTicketConfirmationElements', () => {
        //     afterEach(() => {
        //         jest.resetAllMocks();
        //     });

        //     it('should call the correct method for a school service single ticket', () => {
        //         const singleTicketSpy = jest.spyOn(ticketConfirmation, 'buildSingleTicketConfirmationElements');
        //         const ctx = getMockContext({
        //             session: {
        //                 [SCHOOL_FARE_TYPE_ATTRIBUTE]: { schoolFareType: 'single' },
        //             },
        //         });
        //         singleTicketSpy.mockReturnValue([]);
        //         buildSchoolTicketConfirmationElements(ctx);
        //         expect(singleTicketSpy).toBeCalled();
        //     });

        //     it('should call the correct method for a school service period ticket', () => {
        //         const periodTicketSpy = jest.spyOn(
        //             ticketConfirmation,
        //             'buildPeriodOrMultiOpTicketConfirmationElements',
        //         );
        //         const ctx = getMockContext({
        //             session: {
        //                 [SCHOOL_FARE_TYPE_ATTRIBUTE]: { schoolFareType: 'period' },
        //             },
        //         });
        //         periodTicketSpy.mockReturnValue([]);
        //         buildSchoolTicketConfirmationElements(ctx);
        //         expect(periodTicketSpy).toBeCalled();
        //     });

        //     it('should call the correct method for a school service flat fare ticket', () => {
        //         const flatFareTicketSpy = jest.spyOn(ticketConfirmation, 'buildFlatFareTicketConfirmationElements');
        //         const ctx = getMockContext({
        //             session: {
        //                 [SCHOOL_FARE_TYPE_ATTRIBUTE]: { schoolFareType: 'flatFare' },
        //             },
        //         });
        //         flatFareTicketSpy.mockReturnValue([]);
        //         buildSchoolTicketConfirmationElements(ctx);
        //         expect(flatFareTicketSpy).toBeCalled();
        //     });

        //     it('should throw an error when the fare type is not an expected type', () => {
        //         const ctx = getMockContext({
        //             session: {
        //                 [SCHOOL_FARE_TYPE_ATTRIBUTE]: { schoolFareType: 'not a real fare type' },
        //             },
        //         });
        //         expect(() => buildSchoolTicketConfirmationElements(ctx)).toThrowError(
        //             'Did not receive an expected fareType.',
        //         );
        //     });
        // });

        describe('buildTicketConfirmationElements', () => {
            const singleTicketSpy = jest.spyOn(ticketConfirmation, 'buildSingleTicketConfirmationElements');
            const returnTicketSpy = jest.spyOn(ticketConfirmation, 'buildReturnTicketConfirmationElements');
            const periodTicketSpy = jest.spyOn(ticketConfirmation, 'buildPeriodOrMultiOpTicketConfirmationElements');
            const flatFareTicketSpy = jest.spyOn(ticketConfirmation, 'buildFlatFareTicketConfirmationElements');
            const schoolTicketSpy = jest.spyOn(ticketConfirmation, 'buildSchoolTicketConfirmationElements');

            afterEach(() => {
                jest.resetAllMocks();
            });

            it.each([
                ['single', singleTicketSpy],
                ['return', returnTicketSpy],
                ['period', periodTicketSpy],
                ['flatFare', flatFareTicketSpy],
                ['multiOperator', periodTicketSpy],
                ['schoolService', schoolTicketSpy],
            ])('should call the correct method for a %s ticket', (fareType, spy) => {
                const ctx = getMockContext();
                spy.mockReturnValue([]);
                buildTicketConfirmationElements(fareType, ctx);
                expect(spy).toBeCalledWith(ctx);
            });

            it('should throw an error when the fare type is not an expected type', () => {
                const ctx = getMockContext();
                expect(() => buildTicketConfirmationElements('not a real fare type', ctx)).toThrowError(
                    'Did not receive an expected fareType.',
                );
            });
        });

        describe('getServerSideProps', () => {
            it('should call the buildTicketConfirmationElements method and return valid props', () => {
                const buildConfirmationElementsSpy = jest.spyOn(ticketConfirmation, 'buildTicketConfirmationElements');
                buildConfirmationElementsSpy.mockReturnValue([]);
                const ctx = getMockContext();
                const mockProps: { props: TicketConfirmationProps } = {
                    props: {
                        confirmationElements: expect.any(Array),
                        csrfToken: expect.any(String),
                    },
                };
                const props = getServerSideProps(ctx);
                expect(buildConfirmationElementsSpy).toBeCalled();
                expect(props).toEqual(mockProps);
            });

            it('should throw an error if the fare type is not an expected type', () => {
                const buildConfirmationElementsSpy = jest.spyOn(ticketConfirmation, 'buildTicketConfirmationElements');
                buildConfirmationElementsSpy.mockReturnValue([]);
                const ctx = getMockContext({
                    session: {
                        [FARE_TYPE_ATTRIBUTE]: { fareType: 'not a real fare type' },
                    },
                });
                expect(() => getServerSideProps(ctx)).toThrowError('Did not receive an expected fareType');
            });
        });

        //     it('should render correctly for single tickets', () => {
        //         const tree = shallow(
        //             <TicketConfirmation
        //                 fareTypeProps={{
        //                     service: '3A',
        //                     journeyDirection: 'To London',
        //                     matchedFareStages: [
        //                         { fareStage: 'Bus station', stops: ['at station', 'outside station', 'near park'] },
        //                         { fareStage: 'Longly Church', stops: ['at church', 'outside corner shop', 'near pub'] },
        //                         {
        //                             fareStage: 'London',
        //                             stops: ['at london station', 'outside train station', 'near green park'],
        //                         },
        //                     ],
        //                 }}
        //                 csrfToken=""
        //             />,
        //         );
        //         expect(tree).toMatchSnapshot();
        //     });

        //     it('should render correctly for return tickets', () => {
        //         const tree = shallow(
        //             <TicketConfirmation
        //                 fareTypeProps={{
        //                     service: '2B',
        //                     circular: true,
        //                     inboundMatchedFareStages: [
        //                         { fareStage: 'Bus station', stops: ['at station', 'outside station', 'near park'] },
        //                         { fareStage: 'Longly Church', stops: ['at church', 'outside corner shop', 'near pub'] },
        //                         {
        //                             fareStage: 'London',
        //                             stops: ['at london station', 'outside train station', 'near green park'],
        //                         },
        //                     ],
        //                     outboundMatchedFareStages: [
        //                         { fareStage: 'Another Bus station', stops: ['at station', 'outside station', 'near park'] },
        //                         { fareStage: 'Smally Church', stops: ['at church', 'outside corner shop', 'near pub'] },
        //                         {
        //                             fareStage: 'Liverpool',
        //                             stops: [
        //                                 'at Liverpool station',
        //                                 'outside Liverpool train station',
        //                                 'near Liverpool green park',
        //                             ],
        //                         },
        //                     ],
        //                     nonCircularMatchedFareStages: [],
        //                     validity: { amount: '2', typeOfDuration: 'days' },
        //                 }}
        //                 csrfToken=""
        //             />,
        //         );
        //         expect(tree).toMatchSnapshot();
        //     });

        //     it('should render correctly for period and multiOperator tickets', () => {
        //         const tree = shallow(
        //             <TicketConfirmation
        //                 fareTypeProps={{
        //                     services: ['2A', '7F', '200'],
        //                     zone: true,
        //                     numberOfProducts: 2,
        //                     products: [
        //                         {
        //                             productName: 'Super ticket',
        //                             productPrice: '30',
        //                             productDuration: '2',
        //                             productValidity: '24hr',
        //                         },
        //                         {
        //                             productName: 'Best ticket',
        //                             productPrice: '10',
        //                             productDuration: '22',
        //                             productValidity: '24hr',
        //                         },
        //                         {
        //                             productName: 'Normal ticket',
        //                             productPrice: '3',
        //                             productDuration: '23',
        //                             productValidity: '24hr',
        //                         },
        //                     ],
        //                 }}
        //                 csrfToken=""
        //             />,
        //         );
        //         expect(tree).toMatchSnapshot();
        //     });

        //     it('should render correctly for flat fare tickets', () => {
        //         const tree = shallow(
        //             <TicketConfirmation
        //                 fareTypeProps={{
        //                     services: ['2A', '7F', '200'],
        //                     productName: 'Flat fare ticket',
        //                     productPrice: '60',
        //                 }}
        //                 csrfToken=""
        //             />,
        //         );
        //         expect(tree).toMatchSnapshot();
        //     });
        // });

        // describe('buildTicketConfirmationElements', () => {
        //     it('builds confirmation elements for single tickets', () => {
        //         const result = buildTicketConfirmationElements({
        //             service: '3A',
        //             journeyDirection: 'To London',
        //             matchedFareStages: [
        //                 { fareStage: 'Bus station', stops: ['at station', 'outside station', 'near park'] },
        //                 { fareStage: 'Longly Church', stops: ['at church', 'outside corner shop', 'near pub'] },
        //                 {
        //                     fareStage: 'London',
        //                     stops: ['at london station', 'outside train station', 'near green park'],
        //                 },
        //             ],
        //         });
        //         const expectedResult = [
        //             { content: '3A', href: 'service', name: 'Service' },
        //             { content: 'You submitted or created a fare triangle', href: 'inputMethod', name: 'Fare Triangle' },
        //             {
        //                 content: 'Stops - At station, Outside station, Near park',
        //                 href: 'matching',
        //                 name: 'Fare Stage - Bus station',
        //             },
        //             {
        //                 content: 'Stops - At church, Outside corner shop, Near pub',
        //                 href: 'matching',
        //                 name: 'Fare Stage - Longly Church',
        //             },
        //             {
        //                 content: 'Stops - At london station, Outside train station, Near green park',
        //                 href: 'matching',
        //                 name: 'Fare Stage - London',
        //             },
        //         ];
        //         expect(result).toStrictEqual(expectedResult);
        //     });

        //     it('builds confirmation elements for return tickets', () => {
        //         const result = buildTicketConfirmationElements({
        //             service: '2B',
        //             circular: true,
        //             inboundMatchedFareStages: [
        //                 { fareStage: 'Bus station', stops: ['at station', 'outside station', 'near park'] },
        //                 { fareStage: 'Longly Church', stops: ['at church', 'outside corner shop', 'near pub'] },
        //                 {
        //                     fareStage: 'London',
        //                     stops: ['at london station', 'outside train station', 'near green park'],
        //                 },
        //             ],
        //             outboundMatchedFareStages: [
        //                 { fareStage: 'Another Bus station', stops: ['at station', 'outside station', 'near park'] },
        //                 { fareStage: 'Smally Church', stops: ['at church', 'outside corner shop', 'near pub'] },
        //                 {
        //                     fareStage: 'Liverpool',
        //                     stops: ['at Liverpool station', 'outside Liverpool train station', 'near Liverpool green park'],
        //                 },
        //             ],
        //             nonCircularMatchedFareStages: [],
        //             validity: { amount: '2', typeOfDuration: 'days' },
        //         });
        //         const expectedResult = [
        //             { content: '2B', href: 'service', name: 'Service' },
        //             {
        //                 content: 'Stops - At station, Outside station, Near park',
        //                 href: 'outboundMatching',
        //                 name: 'Outbound Fare Stage - Another Bus station',
        //             },
        //             {
        //                 content: 'Stops - At church, Outside corner shop, Near pub',
        //                 href: 'outboundMatching',
        //                 name: 'Outbound Fare Stage - Smally Church',
        //             },
        //             {
        //                 content: 'Stops - At Liverpool station, Outside Liverpool train station, Near Liverpool green park',
        //                 href: 'outboundMatching',
        //                 name: 'Outbound Fare Stage - Liverpool',
        //             },
        //             {
        //                 content: 'Stops - At station, Outside station, Near park',
        //                 href: 'inboundMatching',
        //                 name: 'Inbound Fare Stage - Bus station',
        //             },
        //             {
        //                 content: 'Stops - At church, Outside corner shop, Near pub',
        //                 href: 'inboundMatching',
        //                 name: 'Inbound Fare Stage - Longly Church',
        //             },
        //             {
        //                 content: 'Stops - At london station, Outside train station, Near green park',
        //                 href: 'inboundMatching',
        //                 name: 'Inbound Fare Stage - London',
        //             },
        //             { content: '2 days', href: 'returnValidity', name: 'Return Validity' },
        //         ];
        //         expect(result).toStrictEqual(expectedResult);
        //     });

        //     it('builds confirmation elements for period and multiOperator tickets', () => {
        //         const result = buildTicketConfirmationElements({
        //             services: ['2A', '7F', '200'],
        //             zone: true,
        //             numberOfProducts: 2,
        //             products: [
        //                 {
        //                     productName: 'Super ticket',
        //                     productPrice: '30',
        //                     productDuration: '1',
        //                     productDurationUnits: 'week',
        //                     productValidity: '24hr',
        //                 },
        //                 {
        //                     productName: 'Best ticket',
        //                     productPrice: '10',
        //                     productDuration: '22',
        //                     productDurationUnits: 'month',
        //                     productValidity: '24hr',
        //                 },
        //                 {
        //                     productName: 'Normal ticket',
        //                     productPrice: '3',
        //                     productDuration: '23',
        //                     productDurationUnits: 'year',
        //                     productValidity: '24hr',
        //                 },
        //             ],
        //         });
        //         const expectedResult = [
        //             { content: 'You uploaded a Fare Zone CSV file', href: 'csvZoneUpload', name: 'Zone' },
        //             { content: 'Price - £30', href: 'multipleProducts', name: 'Product - Super ticket' },
        //             {
        //                 content: 'Duration - 1 week',
        //                 href: 'multipleProducts',
        //                 name: 'Product - Super ticket',
        //             },
        //             { content: 'Validity - 24 Hr', href: 'multipleProductValidity', name: 'Product - Super ticket' },
        //             { content: 'Price - £10', href: 'multipleProducts', name: 'Product - Best ticket' },
        //             {
        //                 content: 'Duration - 22 months',
        //                 href: 'multipleProducts',
        //                 name: 'Product - Best ticket',
        //             },
        //             { content: 'Validity - 24 Hr', href: 'multipleProductValidity', name: 'Product - Best ticket' },
        //             { content: 'Price - £3', href: 'multipleProducts', name: 'Product - Normal ticket' },
        //             {
        //                 content: 'Duration - 23 years',
        //                 href: 'multipleProducts',
        //                 name: 'Product - Normal ticket',
        //             },
        //             { content: 'Validity - 24 Hr', href: 'multipleProductValidity', name: 'Product - Normal ticket' },
        //         ];
        //         expect(result).toStrictEqual(expectedResult);
        //     });

        //     it('builds confirmation elements for flat fare tickets', () => {
        //         const result = buildTicketConfirmationElements({
        //             services: ['2A', '7F', '200'],
        //             productName: 'Flat fare ticket',
        //             productPrice: '60',
        //         });
        //         const expectedResult = [
        //             { content: '2A, 7F, 200', href: 'serviceList', name: 'Services' },
        //             { content: 'Price - £60', href: 'productDetails', name: 'Product - Flat fare ticket' },
        //         ];
        //         expect(result).toStrictEqual(expectedResult);
        //     });
    });
});
