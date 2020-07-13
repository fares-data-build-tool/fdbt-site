import { NextApiResponse } from 'next';
import Cookies from 'cookies';
import { NextApiRequestWithSession } from '../../interfaces';
import { updateSessionAttribute } from '../../utils/sessions';
import {
    getUuidFromCookie,
    redirectToError,
    redirectTo,
    setCookieOnResponseObject,
    unescapeAndDecodeCookie,
} from './apiUtils';
import { putDataInS3, UserFareStages } from '../../data/s3';
import { CSV_UPLOAD_ATTRIBUTE, JOURNEY_COOKIE, INPUT_METHOD_ATTRIBUTE } from '../../constants';
import { isSessionValid } from './service/validator';
import { processFileUpload } from './apiUtils/fileUpload';

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

export const faresTriangleDataMapper = (
    dataToMap: string,
    req: NextApiRequestWithSession,
    res: NextApiResponse,
): UserFareStages | null => {
    const fareTriangle: FareTriangleData = {
        fareStages: [],
    };

    const dataAsLines: string[] = dataToMap.split(/\r?\n/);

    const fareStageCount = dataAsLines.length;

    if (fareStageCount < 2) {
        console.warn(`At least 2 fare stages are needed, only ${fareStageCount} found`);

        updateSessionAttribute(req, CSV_UPLOAD_ATTRIBUTE, { body: 'At least 2 fare stages are needed' });
        redirectTo(res, '/csvUpload');
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

        updateSessionAttribute(req, CSV_UPLOAD_ATTRIBUTE, { body: 'The selected file must use the template' });
        redirectTo(res, '/csvUpload');
        return null;
    }

    return mappedFareTriangle;
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const { fileContents, fileError } = await processFileUpload(req, 'csv-upload');

        if (fileError) {
            updateSessionAttribute(req, CSV_UPLOAD_ATTRIBUTE, { body: fileError });
            redirectTo(res, '/csvUpload');
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
            const journeyCookie = unescapeAndDecodeCookie(cookies, JOURNEY_COOKIE);
            const journeyObject = JSON.parse(journeyCookie);

            setCookieOnResponseObject(INPUT_METHOD_ATTRIBUTE, JSON.stringify({ inputMethod: 'csv' }), req, res);

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
