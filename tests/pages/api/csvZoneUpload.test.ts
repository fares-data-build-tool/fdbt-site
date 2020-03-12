import Cookies from 'cookies';
import { getMockRequestAndResponse } from '../../testData/mockData';
import * as csvZoneUpload from '../../../src/pages/api/csvZoneUpload';
import * as csvData from '../../testData/csvZoneData';
import * as s3 from '../../../src/data/s3';
import * as dynamo from '../../../src/data/dynamodb';

const putStringInS3Spy = jest.spyOn(s3, 'putStringInS3');

describe('csvZoneUpload', () => {
    const writeHeadMock = jest.fn();
    const { req, res } = getMockRequestAndResponse({}, null, {}, writeHeadMock);
    let outputData = '';

    beforeEach(() => {
        process.env.USER_DATA_BUCKET_NAME = 'fdbt-user-data';
        process.env.RAW_USER_DATA_BUCKET_NAME = 'fdbt-raw-user-data';
        jest.resetAllMocks();
        outputData = '';
        Cookies.prototype.set = jest.fn();
        // eslint-disable-next-line no-return-assign
        const storeLog = (inputs: string): string => (outputData += inputs);
        console.warn = jest.fn(storeLog);
    });

    it.each([
        [csvData.testCsv, csvData.unprocessedObject.Body, csvData.processedObject.Body],
        [
            csvData.testCsvWithEmptyCells,
            csvData.unprocessedObjectWithEmptyCells.Body,
            csvData.processedObjectForEmptyCells.Body,
        ],
    ])(
        'should put the unprocessed data in S3 as a csv and the processed data in S3 as json',
        async (csv, expectedUnprocessed, expectedProcessed) => {
            const file = {
                'csv-upload': {
                    size: 999,
                    path: 'string',
                    name: 'string',
                    type: 'text/csv',
                    toJSON(): string {
                        return '';
                    },
                },
            };

            jest.spyOn(csvZoneUpload, 'getFormData')
                .mockImplementation()
                .mockResolvedValue({
                    Files: file,
                    FileContent: csv,
                });

            jest.spyOn(dynamo, 'getAtcoCodesByNaptanCodes')
                .mockImplementation()
                .mockResolvedValue([{ atcoCode: 'TestATCO-TC5', naptanCode: 'TestNaptan-TC5' }]);

            await csvZoneUpload.default(req, res);

            expect(putStringInS3Spy.mock.calls).toEqual([
                [
                    'fdbt-raw-user-data',
                    expect.any(String),
                    JSON.stringify(expectedUnprocessed),
                    'text/csv; charset=utf-8',
                ],
                [
                    'fdbt-user-data',
                    expect.any(String),
                    JSON.stringify(expectedProcessed),
                    'application/json; charset=utf-8',
                ],
            ]);

            expect(s3.putStringInS3).toBeCalledTimes(2);
        },
    );

    it('should return 302 redirect to /periodProduct when valid a valid file is processed and put in S3', async () => {
        const file = {
            'csv-upload': {
                size: 999,
                path: 'string',
                name: 'string',
                type: 'text/csv',
                toJSON(): string {
                    return '';
                },
            },
        };

        jest.spyOn(csvZoneUpload, 'getFormData')
            .mockImplementation()
            .mockResolvedValue({
                Files: file,
                FileContent: csvData.testCsv,
            });
        await csvZoneUpload.default(req, res);

        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/periodProduct',
        });
    });

    // it('should extract the file data submitted via the UI', () => {

    // });

    // it('should redirect to /error when an error is thrown in the default', () => {

    // });

    describe('fileIsValid', () => {
        it('should return 302 redirect to /csvZoneUpload when an empty file is attached', async () => {
            const file = {
                'csv-upload': {
                    size: 999,
                    path: 'string',
                    name: 'string',
                    type: 'text/csv',
                    toJSON(): string {
                        return '';
                    },
                },
            };

            jest.spyOn(csvZoneUpload, 'getFormData')
                .mockImplementation()
                .mockResolvedValue({
                    Files: file,
                    FileContent: '',
                });
            await csvZoneUpload.default(req, res);

            expect(writeHeadMock).toBeCalledWith(302, {
                Location: '/csvZoneUpload',
            });
        });

        it('should return 302 redirect to /error when file is too big', async () => {
            const file = {
                'csv-upload': {
                    size: 6000000,
                    path: 'string',
                    name: 'string',
                    type: 'text/csv',
                    toJSON(): string {
                        return '';
                    },
                },
            };

            jest.spyOn(csvZoneUpload, 'getFormData')
                .mockImplementation()
                .mockResolvedValue({
                    Files: file,
                    FileContent: csvData.testCsv,
                });
            await csvZoneUpload.default(req, res);

            expect(writeHeadMock).toBeCalledWith(302, {
                Location: '/error',
            });
        });

        it('should return 302 redirect to /error when file is not an allowed type', async () => {
            const file = {
                'csv-upload': {
                    size: 999,
                    path: 'string',
                    name: 'string',
                    type: 'text/pdf',
                    toJSON(): string {
                        return '';
                    },
                },
            };

            jest.spyOn(csvZoneUpload, 'getFormData')
                .mockImplementation()
                .mockResolvedValue({
                    Files: file,
                    FileContent: csvData.testCsv,
                });
            await csvZoneUpload.default(req, res);

            expect(writeHeadMock).toBeCalledWith(302, {
                Location: '/error',
            });
        });
    });

    // describe('processCsvUpload', () => {
    //     it('should skip empty lines in the csv', () => {

    //     });
    // });

    // describe('formatDynamoResponse', () => {
    //     it('should return an array of UserFareZone objects when called with an array of naptan codes', () => {

    //     });
    // });
});
