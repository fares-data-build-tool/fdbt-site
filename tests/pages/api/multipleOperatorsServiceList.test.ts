import { getMockRequestAndResponse } from '../../testData/mockData';
import multipleOperatorsServiceList from '../../../src/pages/api/multipleOperatorsServiceList';
import { MULTIPLE_OPERATOR_ATTRIBUTE, MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE } from '../../../src/constants';

describe('multipleOperatorsServiceList', () => {
    const selectAllFalseUrl = '/multipleOperatorsServiceList?selectAll=false';
    const writeHeadMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('redirects back to /serviceList if there are errors', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            mockEndFn: jest.fn(),
            requestHeaders: {
                referer: `http://localhost:5000${selectAllFalseUrl}`,
            },
            session: {
                [MULTIPLE_OPERATOR_ATTRIBUTE]: {
                    selectedOperators: [
                        { operatorPublicName: 'Test1', nocCode: 'N1' },
                        { operatorPublicName: 'Test2', nocCode: 'N2' },
                        { operatorPublicName: 'Test3', nocCode: 'N3' },
                    ],
                },
            },
        });

        multipleOperatorsServiceList(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: selectAllFalseUrl,
        });
    });

    it('should change the query string for select all to true when select all button is selected', () => {
        const selectAllTrueUrl = '/multipleOperatorsServiceList?selectAll=true';
        const { req, res } = getMockRequestAndResponse({
            body: { selectAll: 'Select All Services' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            mockEndFn: jest.fn(),
            requestHeaders: {
                referer: `http://localhost:5000${selectAllFalseUrl}`,
            },
            session: {
                [MULTIPLE_OPERATOR_ATTRIBUTE]: {
                    selectedOperators: [
                        { operatorPublicName: 'Test1', nocCode: 'N1' },
                        { operatorPublicName: 'Test2', nocCode: 'N2' },
                        { operatorPublicName: 'Test3', nocCode: 'N3' },
                    ],
                },
            },
        });

        multipleOperatorsServiceList(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: selectAllTrueUrl,
        });
    });

    it('redirects to /howManyProducts if input is valid and the user is entering details for a period ticket', () => {
        const serviceInfo = {
            'MCTR#237#11-237-_-y08-1#07/04/2020': 'Ashton Under Lyne - Glossop',
            'MCTR#391#NW_01_MCT_391_1#23/04/2019': 'Macclesfield - Bollington - Poynton - Stockport',
            'MCTR#232#NW_04_MCTR_232_1#06/04/2020': 'Ashton - Hurst Cross - Broadoak Circular',
        };

        const { req, res } = getMockRequestAndResponse({
            body: { ...serviceInfo },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            mockEndFn: jest.fn(),
            requestHeaders: {
                referer: `http://localhost:5000${selectAllFalseUrl}`,
            },
            session: {
                [MULTIPLE_OPERATOR_ATTRIBUTE]: {
                    selectedOperators: [
                        { operatorPublicName: 'Test1', nocCode: 'N1' },
                        { operatorPublicName: 'Test2', nocCode: 'N2' },
                        { operatorPublicName: 'Test3', nocCode: 'N3' },
                    ],
                },
                [MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE]: [
                    {
                        nocCode: 'N1',
                        services: ['service one', 'service two'],
                    },
                    {
                        nocCode: 'N2',
                        services: ['service one', 'service two'],
                    },
                ],
            },
        });

        multipleOperatorsServiceList(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/howManyProducts',
        });
    });
});
