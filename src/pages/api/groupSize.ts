import { NextApiResponse } from 'next';
import * as yup from 'yup';
import {
    NextApiRequestWithSession,
    ErrorInfo,
    GroupTicketAttribute,
    GroupTicketAttributeWithErrors,
} from '../../interfaces';
import { GROUP_SIZE_ATTRIBUTE } from '../../constants';
import { removeAllWhiteSpace } from './apiUtils/validator';
import { redirectToError, redirectTo } from './apiUtils';
import { updateSessionAttribute } from '../../utils/sessions';

const wrongInputError = 'Enter a whole number between 1 and 30';

export const groupSizeSchema = yup
    .number()
    .typeError(wrongInputError)
    .integer(wrongInputError)
    .min(1, wrongInputError)
    .max(30, wrongInputError);

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const { maxGroupSize } = req.body;

        const attributeValue: GroupTicketAttribute = {
            maxGroupSize: removeAllWhiteSpace(maxGroupSize),
        };
        let errors: ErrorInfo[] = [];

        try {
            await groupSizeSchema.validate(attributeValue.maxGroupSize, { abortEarly: false });
        } catch (validationErrors) {
            const validityErrors: yup.ValidationError = validationErrors;
            errors = validityErrors.inner.map(error => {
                return {
                    id: 'max-group-size',
                    errorMessage: error.message,
                    userInput: attributeValue.maxGroupSize,
                };
            });
        }
        if (errors.length > 0) {
            const attributeValueWithErrors: GroupTicketAttributeWithErrors = {
                maxGroupSize: attributeValue.maxGroupSize,
                errors,
            };
            updateSessionAttribute(req, GROUP_SIZE_ATTRIBUTE, attributeValueWithErrors);
            redirectTo(res, '/groupSize');
            return;
        }

        updateSessionAttribute(req, GROUP_SIZE_ATTRIBUTE, attributeValue);
        redirectTo(res, '/groupPassengerTypes');
    } catch (error) {
        const message = 'There was a problem setting the total group size:';
        redirectToError(res, message, 'api.groupSize', error);
    }
};
