
jest.mock('../../src/data/auroradb', () => {
    return jest.fn().mockImplementation(() => {
        return {
            getAuroraDBClient: () => {console.log("get the client"); return null},
        };
    });
});

import * as React from 'react';
import { shallow } from 'enzyme';
import * as auroradb from '../../src/data/auroradb';

import Direction, { getServerSideProps } from '../../src/pages/direction';
import { getServiceByNocCodeAndLineName, batchGetStopsByAtcoCode } from '../../src/data/auroradb';
import { mockRawService, mockService, mockRawServiceWithDuplicates, getMockContext } from '../testData/mockData';


//jest.mock('../../src/data/auroradb.ts');

// jest.mock('aws-param-store');

// const ssmGetParameterSync = jest.fn().mockReturnValue({
//     promise: jest.fn().mockResolvedValue({
//         Parameter: {
//             Name: 'NAME',
//             Type: 'SecureString',
//             Value: 'VALUE',
//             Version: 1,
//             LastModifiedDate: 1546551668.495,
//             ARN: 'arn:aws:ssm:ap-southeast-2:123:NAME'
//         }
//     })
// });

describe('pages', () => {
    describe('direction', () => {
        beforeEach(() => {
            (auroradb.getServiceByNocCodeAndLineName as jest.Mock).mockImplementation(() => mockRawService);
            (auroradb.batchGetStopsByAtcoCode as jest.Mock).mockImplementation(() => [{ localityName: '' }]);
        });

        it('should render correctly', () => {
            const tree = shallow(<Direction operator="Connexions Buses" lineName="X6A" service={mockService} />);
            expect(tree).toMatchSnapshot();
        });

        it('shows operator name above the select box', () => {
            const wrapper = shallow(<Direction operator="Connexions Buses" lineName="X6A" service={mockService} />);
            const journeyWelcome = wrapper.find('#direction-operator-linename-hint').first();

            expect(journeyWelcome.text()).toBe('Connexions Buses - X6A');
        });

        it('shows a list of journey patterns for the service in the select box', () => {
            const wrapper = shallow(<Direction operator="Connexions Buses" lineName="X6A" service={mockService} />);
            const serviceJourney = wrapper.find('.journey-option');

            expect(serviceJourney).toHaveLength(2);
            expect(serviceJourney.first().text()).toBe('Estate (Hail and Ride) N/B TO Interchange Stand B');
            expect(serviceJourney.at(1).text()).toBe('Interchange Stand B TO Estate (Hail and Ride) N/B');
        });

        it('returns operator value and list of services when operator cookie exists with NOCCode', async () => {
            (({ ...getServiceByNocCodeAndLineName } as jest.Mock).mockImplementation(() => mockRawService));
            const operator = 'HCTY';
            const lineName = 'X6A';

            const ctx = getMockContext({ operator, serviceLineName: lineName });

            const result = await getServerSideProps(ctx);

            expect(result).toEqual({
                props: {
                    operator,
                    lineName,
                    service: mockService,
                },
            });
        });

        it('removes journeys that have the same start and end points before rendering', async () => {
            (({ ...getServiceByNocCodeAndLineName } as jest.Mock).mockImplementation(
                () => mockRawServiceWithDuplicates,
            ));
            const operator = 'HCTY';
            const lineName = 'X6A';

            const ctx = getMockContext({ operator, serviceLineName: lineName });

            const result = await getServerSideProps(ctx);

            expect(result).toEqual({
                props: {
                    operator,
                    lineName,
                    service: mockService,
                },
            });
        });

        it('throws an error if no journey patterns can be found', async () => {
            (({ ...getServiceByNocCodeAndLineName } as jest.Mock).mockImplementation(() => Promise.resolve(null)));

            const ctx = getMockContext();

            await expect(getServerSideProps(ctx)).rejects.toThrow();
        });

        it('throws an error if the operator or service cookies do not exist', async () => {
            const ctx = getMockContext({ operator: null, serviceLineName: null });

            await expect(getServerSideProps(ctx)).rejects.toThrow('Necessary cookies not found to show direction page');
        });
    });
});
