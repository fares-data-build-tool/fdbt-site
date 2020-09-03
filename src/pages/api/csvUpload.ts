import { NextApiRequest, NextApiResponse } from 'next';
import uniq from 'lodash/uniq';
import { NextApiRequestWithSession } from '../../interfaces/index';
import { getUuidFromCookie, redirectToError, redirectTo, setCookieOnResponseObject } from './apiUtils';
import { putDataInS3, UserFareStages } from '../../data/s3';
import { CSV_UPLOAD_COOKIE, JOURNEY_ATTRIBUTE, INPUT_METHOD_ATTRIBUTE } from '../../constants';
import { isSessionValid } from './apiUtils/validator';
import { processFileUpload } from './apiUtils/fileUpload';
import logger from '../../utils/logger';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import { isJourney } from './apiUtils/typeChecking';

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

export const setUploadCookieAndRedirect = (req: NextApiRequest, res: NextApiResponse, error = ''): void => {
    const cookieValue = JSON.stringify({ error });
    setCookieOnResponseObject(CSV_UPLOAD_COOKIE, cookieValue, req, res);

    if (error) {
        redirectTo(res, '/csvUpload');
    }
};

export const containsDuplicateFareStages = (fareStageNames: string[]): boolean =>
    uniq(fareStageNames).length !== fareStageNames.length;

export const faresTriangleDataMapper = (
    dataToMap: string,
    req: NextApiRequest,
    res: NextApiResponse,
): UserFareStages | null => {
    const fareTriangle: FareTriangleData = {
        fareStages: [],
    };

    const dataAsLines: string[] = dataToMap.split(/\r?\n/);

    const fareStageCount = dataAsLines.length;

    if (fareStageCount < 2) {
        logger.warn('', {
            context: 'api.csvUpload',
            message: `At least 2 fare stages are needed, only ${fareStageCount} found`,
        });

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

    const fareStageNames: string[] = mappedFareTriangle.fareStages.map(fareStage => fareStage.stageName);

    if (containsDuplicateFareStages(fareStageNames)) {
        logger.warn('', {
            context: 'api.csvUpload',
            message: `Duplicate fare stage names found, fare stage names: ${fareStageNames}`,
        });

        setUploadCookieAndRedirect(req, res, 'Fare stage names cannot be the same');
        return null;
    }

    const numberOfPrices = mappedFareTriangle.fareStages.flatMap(stage =>
        stage.prices.flatMap(price => price.fareZones),
    ).length;

    if (numberOfPrices !== expectedNumberOfPrices) {
        logger.warn('', {
            context: 'api.csvUpload',
            message: `Data conversion has not worked properly. Expected ${expectedNumberOfPrices}, got ${numberOfPrices}`,
        });

        setUploadCookieAndRedirect(req, res, 'The selected file must use the template');
        return null;
    }

    return mappedFareTriangle;
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
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

            updateSessionAttribute(req, INPUT_METHOD_ATTRIBUTE, { inputMethod: 'csv' });

            const journeyAttribute = getSessionAttribute(req, JOURNEY_ATTRIBUTE);

            if (isJourney(journeyAttribute) && journeyAttribute?.outboundJourney) {
                redirectTo(res, '/outboundMatching');
                return;
            }

            redirectTo(res, '/matching');
        }
    } catch (error) {
        const message = 'There was a problem uploading the CSV:';
        redirectToError(res, message, 'api.csvUpload', error);
    }
};
