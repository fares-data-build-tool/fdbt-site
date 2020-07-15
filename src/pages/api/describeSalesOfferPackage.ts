import { NextApiResponse } from 'next';
import * as yup from 'yup';
import { SOP_ATTRIBUTE } from '../../constants/index';
import { redirectToError, redirectTo } from './apiUtils';
import { isSessionValid } from './service/validator';
import { NextApiRequestWithSession, ErrorInfo } from '../../interfaces';
import { SalesOfferPackageParams } from '../describeSalesOfferPackage';

export interface SalesOfferPackageInfo extends SalesOfferPackageParams {
    name: string;
    description: string;
    errors: ErrorInfo[];
}

const noInputError = (input: string): string => `Enter a ${input} for your sales offer package`;
const inputTooLongError = (input: string, max: number): string =>
    `Your sales offer package ${input} must be ${max} characters or less`;

const sopInfoSchema = yup.object({
    name: yup
        .string()
        .min(0, noInputError('name'))
        .max(20, inputTooLongError('name', 20))
        .required(noInputError('name')),
    description: yup
        .string()
        .min(0, noInputError('description'))
        .max(50, inputTooLongError('description', 50))
        .required(noInputError('description')),
});

const checkUserInput = async (sopInfo: SalesOfferPackageInfo): Promise<SalesOfferPackageInfo> => {
    let errors: ErrorInfo[] = [];
    try {
        await sopInfoSchema.validate(sopInfo, { abortEarly: false });
    } catch (validationErrors) {
        const validityErrors: yup.ValidationError = validationErrors;
        console.log({ validityErrors });
        errors = validityErrors.inner.map(error => ({ errorMessage: error.message, id: error.path }));
    }
    if (errors.length > 0) {
        return {
            ...sopInfo,
            errors,
        };
    }
    return sopInfo;
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('Session is invalid.');
        }

        const salesOfferPackageParams: SalesOfferPackageInfo = req?.session?.[SOP_ATTRIBUTE];
        const { salesOfferPackageName, salesOfferPackageDescription } = req.body;
        let salesOfferPackageInfo: SalesOfferPackageInfo = {
            ...salesOfferPackageParams,
            name: salesOfferPackageName,
            description: salesOfferPackageDescription,
        };

        salesOfferPackageInfo = await checkUserInput(salesOfferPackageInfo);

        // if (salesOfferPackageInfo.errors) {
        // }

        console.log({ salesOfferPackageInfo });
        console.log('SOP_ATTRIBUTE on session: ', req.session[SOP_ATTRIBUTE]);
        redirectTo(res, '/describeSalesOfferPackage');
    } catch (error) {
        const message = 'There was a problem on the describe sales offer package API.';
        redirectToError(res, message, error);
    }
};
