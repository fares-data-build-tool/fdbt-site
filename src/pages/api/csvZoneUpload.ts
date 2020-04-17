import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { Files } from 'formidable';
import csvParse from 'csv-parse/lib/sync';
import fs from 'fs';
import { getDomain, getUuidFromCookie, setCookieOnResponseObject, redirectToError, redirectTo } from './apiUtils';
import { putDataInS3, UserFareZone } from '../../data/s3';
import { getAtcoCodesByNaptanCodes } from '../../data/auroradb';
import { CSV_ZONE_UPLOAD_COOKIE, ALLOWED_CSV_FILE_TYPES } from '../../constants';
import { isSessionValid } from './service/validator';

const MAX_FILE_SIZE = 5242880;

export type File = FileData;

interface FileData {
    Files: formidable.Files;
    FileContent: string;
}

// The below 'config' needs to be exported for the formidable library to work.
export const config = {
    api: {
        bodyParser: false,
    },
};

export const formParse = async (req: NextApiRequest): Promise<Files> => {
    return new Promise<Files>((resolve, reject) => {
        const form = new formidable.IncomingForm();
        form.parse(req, (err, _fields, file) => {
            if (err) {
                return reject(err);
            }
            return resolve(file);
        });
    });
};

export const setUploadCookieAndRedirect = (req: NextApiRequest, res: NextApiResponse, error = ''): void => {
    const cookieValue = JSON.stringify({ error });
    setCookieOnResponseObject(getDomain(req), CSV_ZONE_UPLOAD_COOKIE, cookieValue, req, res);
    redirectTo(res, '/csvZoneUpload');
};

export const fileIsValid = (
    req: NextApiRequest,
    res: NextApiResponse,
    formData: formidable.Files,
    fileContent: string,
): boolean => {
    const fileSize = formData['csv-upload'].size;
    const fileType = formData['csv-upload'].type;

    if (!fileContent) {
        setUploadCookieAndRedirect(req, res, 'Select a CSV file to upload');
        console.warn('No file attached.');
        return false;
    }

    if (fileSize > MAX_FILE_SIZE) {
        setUploadCookieAndRedirect(req, res, 'The selected file must be smaller than 5MB');
        console.warn(`File is too large. Uploaded file is ${fileSize} Bytes, max size is ${MAX_FILE_SIZE} Bytes`);
        return false;
    }

    if (!ALLOWED_CSV_FILE_TYPES.includes(fileType)) {
        setUploadCookieAndRedirect(req, res, 'The selected file must be a CSV');
        console.warn(`File not of allowed type, uploaded file is ${fileType}`);
        return false;
    }

    return true;
};

export const csvParser = (stringifiedCsvData: string): UserFareZone[] => {
    const parsedFileContent: UserFareZone[] = csvParse(stringifiedCsvData, {
        columns: true,
        skip_empty_lines: false, // eslint-disable-line @typescript-eslint/camelcase
        delimiter: ',',
    });
    return parsedFileContent;
};

export const getFormData = async (req: NextApiRequest): Promise<File> => {
    const files = await formParse(req);
    const stringifiedFileContent = await fs.promises.readFile(files['csv-upload'].path, 'utf-8');
    return {
        Files: files,
        FileContent: stringifiedFileContent,
    };
};

export const formatDynamoResponse = async (
    rawUserFareZones: UserFareZone[],
    naptanCodesToQuery: string[],
): Promise<UserFareZone[]> => {
    try {
        const atcoItems = await getAtcoCodesByNaptanCodes(naptanCodesToQuery);
        const userFareZones = rawUserFareZones.map(rawUserFareZone => {
            const atcoItem = atcoItems.find(item => rawUserFareZone.NaptanCodes === item.naptanCode);
            if (atcoItem) {
                return {
                    ...rawUserFareZone,
                    AtcoCodes: atcoItem.atcoCode,
                };
            }
            return rawUserFareZone;
        });
        return userFareZones;
    } catch (error) {
        throw new Error(
            `Could not fetch data from Dynamo (Naptan Table) for naptanCodes: ${naptanCodesToQuery}. Error: ${error.stack}`,
        );
    }
};

export const processCsvUpload = async (fileContent: string): Promise<UserFareZone[]> => {
    const parsedFileContent = csvParser(fileContent);
    try {
        const { FareZoneName } = parsedFileContent[0];
        const rawUserFareZones = parsedFileContent
            .map(parsedItem => {
                const item = { FareZoneName, NaptanCodes: parsedItem.NaptanCodes, AtcoCodes: parsedItem.AtcoCodes };
                if (item.FareZoneName === undefined || item.NaptanCodes === undefined || item.AtcoCodes === undefined) {
                    throw new Error(
                        'The uploaded CSV was not of the correct format. One of the required columns of information is missing or misnamed.',
                    );
                }
                return item;
            })
            .filter(parsedItem => parsedItem.NaptanCodes !== '' || parsedItem.AtcoCodes !== '');
        if (rawUserFareZones.length === 0) {
            throw new Error('The uploaded CSV contained no Naptan Codes or Atco Codes');
        }
        let userFareZones = rawUserFareZones;
        const naptanCodesToQuery = rawUserFareZones
            .filter(rawUserFareZone => rawUserFareZone.AtcoCodes === '')
            .map(rawUserFareZone => rawUserFareZone.NaptanCodes);
        if (naptanCodesToQuery.length !== 0) {
            userFareZones = await formatDynamoResponse(rawUserFareZones, naptanCodesToQuery);
        }
        return userFareZones;
    } catch (error) {
        throw new Error(error.stack);
    }
};

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const formData = await getFormData(req);
        if (!fileIsValid(req, res, formData.Files, formData.FileContent)) {
            return;
        }

        if (formData.FileContent) {
            const uuid = getUuidFromCookie(req, res);
            await putDataInS3(formData.FileContent, `${uuid}.csv`, false);
            const userFareZones = await processCsvUpload(formData.FileContent);
            const fareZoneName = userFareZones[0].FareZoneName;
            await putDataInS3(userFareZones, `${uuid}.json`, true);
            const cookieValue = JSON.stringify({ fareZoneName, uuid });
            setCookieOnResponseObject(getDomain(req), CSV_ZONE_UPLOAD_COOKIE, cookieValue, req, res);

            redirectTo(res, '/periodProduct');
        }
    } catch (error) {
        const message = 'There was a problem uploading the csv:';
        redirectToError(res, message, error);
    }
};
