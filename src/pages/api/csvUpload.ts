import { NextApiResponse } from 'next';
import Cookies from 'cookies';
import { getUuidFromCookie, unescapeAndDecodeCookie } from '../../utils';
import { redirectToError, redirectTo, setCookieOnResponseObject } from './apiUtils';
import { putDataInS3, UserFareStages } from '../../data/s3';
import { CSV_UPLOAD_ATTRIBUTE, JOURNEY_ATTRIBUTE, INPUT_METHOD_ATTRIBUTE } from '../../constants';
import { isSessionValid } from './service/validator';
import { processFileUpload } from './apiUtils/fileUpload';
import { NextRequestWithSession } from '../../interfaces';

interface FareTriangleData {
    fareStages: {
        stageName: string;
        prices: {
            [key: string]: {
                price: string;
                fareZones: string[];
            };
        };
    }[];
}

export const config = {
    api: {
        bodyParser: false,
    },
};

export const setUploadCookieAndRedirect = (req: NextRequestWithSession, res: NextApiResponse, error = ''): void => {
    const cookieValue = JSON.stringify({ error });
    setCookieOnResponseObject(req, res, CSV_UPLOAD_ATTRIBUTE, cookieValue);

    if (error) {
        redirectTo(res, '/csvUpload');
    }
};

export const faresTriangleDataMapper = (
    dataToMap: string,
    req: NextRequestWithSession,
    res: NextApiResponse,
): UserFareStages | null => {
    const fareTriangle: FareTriangleData = {
        fareStages: [],
    };

    const dataAsLines: string[] = dataToMap.split(/\r?\n/);

    const fareStageCount = dataAsLines.length;

    if (fareStageCount < 2) {
        console.warn(`At least 2 fare stages are needed, only ${fareStageCount} found`);

        setUploadCookieAndRedirect(req, res, 'At least 2 fare stages are needed');
        return null;
    }

    let expectedNumberOfPrices = 0;

    for (let rowNum = 0; rowNum < dataAsLines.length; rowNum += 1) {
        const items = dataAsLines[rowNum].split(',');
        const trimmedItems = items.map(item => item.trim());
        const stageName = trimmedItems[rowNum + 1];

        if (trimmedItems.every(item => item === '' || item === null)) {
            break;
        } else {
            expectedNumberOfPrices += rowNum;
        }

        fareTriangle.fareStages[rowNum] = {
            stageName,
            prices: {},
        };

        for (let colNum = 0; colNum < rowNum; colNum += 1) {
            const price = trimmedItems[colNum + 1];

            // Check explicitly for number to account for invalid fare data
            if (price && !Number.isNaN(Number(price)) && stageName) {
                if (fareTriangle.fareStages?.[colNum].prices?.[price]?.fareZones) {
                    fareTriangle.fareStages[colNum].prices[price].fareZones.push(stageName);
                } else {
                    fareTriangle.fareStages[colNum].prices[price] = {
                        price: (parseFloat(price) / 100).toFixed(2),
                        fareZones: [stageName],
                    };
                }
            }
        }
    }

    const mappedFareTriangle: UserFareStages = {
        fareStages: fareTriangle.fareStages.map(item => ({
            ...item,
            prices: Object.values(item.prices),
        })),
    };

    const numberOfPrices = mappedFareTriangle.fareStages.flatMap(stage =>
        stage.prices.flatMap(price => price.fareZones),
    ).length;

    if (numberOfPrices !== expectedNumberOfPrices) {
        console.warn(
            `Data conversion has not worked properly. Expected ${expectedNumberOfPrices}, got ${numberOfPrices}`,
        );

        setUploadCookieAndRedirect(req, res, 'The selected file must use the template');
        return null;
    }

    return mappedFareTriangle;
};

export default async (req: NextRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const { fileContents, fileError } = await processFileUpload(req, 'csv-upload');

        if (fileError) {
            setUploadCookieAndRedirect(req, res, fileError);
            return;
        }

        if (fileContents) {
            const uuid = getUuidFromCookie(req, res);
            await putDataInS3(fileContents, `${uuid}.csv`, false);
            const fareTriangleData = faresTriangleDataMapper(fileContents, req, res);
            if (!fareTriangleData) {
                return;
            }

            await putDataInS3(fareTriangleData, `${uuid}.json`, true);

            const cookies = new Cookies(req, res);
            const journeyCookie = unescapeAndDecodeCookie(cookies, JOURNEY_ATTRIBUTE);
            const journeyObject = JSON.parse(journeyCookie);

            setCookieOnResponseObject(req, res, INPUT_METHOD_ATTRIBUTE, JSON.stringify({ inputMethod: 'csv' }));

            if (journeyObject?.outboundJourney) {
                redirectTo(res, '/outboundMatching');
                return;
            }

            redirectTo(res, '/matching');
        }
    } catch (error) {
        const message = 'There was a problem uploading the csv:';
        redirectToError(res, message, error);
    }
};
