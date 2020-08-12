import { NextApiResponse } from 'next';
import * as yup from 'yup';
import isArray from 'lodash/isArray';
import { redirectToError, redirectTo } from './apiUtils/index';
import { TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE } from '../../constants/index';
import { isSessionValid } from './apiUtils/validator';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { updateSessionAttribute } from '../../utils/sessions';

export interface TimeRestrictionsDefinition {
    startTime?: string;
    endTime?: string;
    validDays?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
}

export interface TimeRestrictionsDefinitionWithErrors extends TimeRestrictionsDefinition {
    errors: ErrorInfo[];
}

const radioButtonError = 'Choose one of the options below';
const timeRestrictionValidityError = 'Enter a time between 0000 - 2400';
const timeRestrictionInputError = 'Enter a start or end time in 24 hour format';
const daySelectionError = 'Select at least one day';
const endTimeEarlierThanStartTimeError = 'The end time cannot be earlier than the start time';
const startTimeLaterThanEndTimeError = 'The start time cannot be later than the end time';

const endTimeInputSchema = yup
    .number()
    .typeError(timeRestrictionValidityError)
    .integer(timeRestrictionValidityError)
    .max(2400, timeRestrictionValidityError);

const startTimeInputSchema = yup
    .number()
    .typeError(timeRestrictionValidityError)
    .integer(timeRestrictionValidityError)
    .min(0, timeRestrictionValidityError);

export const timeRestrictionInputSchema = yup.object({
    startTime: yup.number().when('timeRestriction', {
        is: 'Yes',
        then: yup
            .number()
            .when('endTime', {
                is: endTimeValue => !!endTimeValue,
                then: startTimeInputSchema.max(yup.ref('endTime'), startTimeLaterThanEndTimeError).notRequired(),
            })
            .when('endTime', {
                is: endTimeValue => !endTimeValue,
                then: startTimeInputSchema.max(2400, timeRestrictionValidityError).required(timeRestrictionInputError),
            }),
    }),
    endTime: yup.number().when('timeRestriction', {
        is: 'Yes',
        then: yup
            .number()
            .when('startTime', {
                is: startTimeValue => !!startTimeValue,
                then: endTimeInputSchema.min(yup.ref('startTime'), endTimeEarlierThanStartTimeError).notRequired(),
            })
            .when('startTime', {
                is: startTimeValue => !startTimeValue,
                then: endTimeInputSchema.min(0, timeRestrictionValidityError).required(timeRestrictionInputError),
            }),
    }),
});

export const defineTimeRestrictionsSchema = yup
    .object({
        timeRestriction: yup
            .string()
            .oneOf(['Yes', 'No'])
            .required(radioButtonError),
        validDays: yup
            .string()
            .oneOf(['Yes', 'No'])
            .required(radioButtonError),
        startTime: yup.string().when('timeRestriction', {
            is: 'Yes',
            then: yup.string().length(4, timeRestrictionInputError),
        }),
        endTime: yup.string().when('timeRestriction', {
            is: 'Yes',
            then: yup.string().length(4, timeRestrictionInputError),
        }),
        days: yup.string().when('validDays', { is: 'Yes', then: yup.string().required(daySelectionError) }),
    })
    .required();

export const formatRequestBody = (req: NextApiRequestWithSession): TimeRestrictionsDefinition => {
    const filteredReqBody: { [key: string]: string | string[] } = {};
    Object.entries(req.body).forEach(entry => {
        if (entry[0] === 'startTime' || entry[0] === 'endTime') {
            const input = entry[1] as string;
            const strippedInput = input.replace(/\s+/g, '');
            if (strippedInput === '') {
                return;
            }
            filteredReqBody[entry[0]] = strippedInput;
            return;
        }
        if (entry[0] === 'days') {
            filteredReqBody[entry[0]] = !isArray(entry[1]) ? [entry[1] as string] : (entry[1] as string[]);
            return;
        }
        filteredReqBody[entry[0]] = entry[1] as string;
    });
    return filteredReqBody;
};

export const getErrorIdFromValidityError = (errorPath: string): string => {
    switch (errorPath) {
        case 'timeRestriction':
            return 'define-time-restrictions';
        case 'validDays':
            return 'define-valid-days';
        case 'startTime':
            return 'start-time';
        case 'endTime':
            return 'end-time';
        case 'days':
            return 'valid-days-required';
        default:
            throw new Error(`Could not match the following error with an expected input. Error path: ${errorPath}.`);
    }
};

export const runValidationSchema = async (
    schema: yup.ObjectSchema,
    reqBody: TimeRestrictionsDefinition,
    initialErrors: ErrorInfo[] = [],
): Promise<ErrorInfo[]> => {
    let errors: ErrorInfo[] = [];
    try {
        await schema.validate(reqBody, { abortEarly: false });
    } catch (validationErrors) {
        const validityErrors: yup.ValidationError = validationErrors;
        errors = validityErrors.inner.map(error => ({
            id: getErrorIdFromValidityError(error.path),
            errorMessage: error.message,
            userInput: error.value,
        }));
    }
    if (initialErrors.length === 0) {
        errors = errors.concat(initialErrors);
    } else if (initialErrors.length > 0) {
        // TODO - Add functionality to check the intialErrors array for errors with the same ID as those in the new errors array. If the initialErrors array already contains an error with the same ID as one of the new errors, the new error should be ignored.
    }
    return errors;
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        if (!isSessionValid(req, res)) {
            throw new Error('session is invalid.');
        }

        const filteredReqBody = formatRequestBody(req);

        const { startTime, endTime, validDays } = filteredReqBody;

        const firstSchemaErrors = await runValidationSchema(defineTimeRestrictionsSchema, filteredReqBody);
        const secondSchemaErrors = await runValidationSchema(
            timeRestrictionInputSchema,
            filteredReqBody,
            firstSchemaErrors,
        );

        console.log({ secondSchemaErrors });

        const timeRestrictionsDefinition: TimeRestrictionsDefinition = {
            startTime,
            endTime,
            validDays,
        };

        if (secondSchemaErrors.length > 0) {
            const timeRestrictionsDefinitionWithErrors: TimeRestrictionsDefinitionWithErrors = {
                ...timeRestrictionsDefinition,
                errors: secondSchemaErrors,
            };
            updateSessionAttribute(req, TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE, timeRestrictionsDefinitionWithErrors);
            redirectTo(res, '/defineTimeRestrictions');
            return;
        }

        updateSessionAttribute(req, TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE, timeRestrictionsDefinition);
        redirectTo(res, '/defineTimeRestrictions');
    } catch (error) {
        const message = 'There was a problem in the defineTimeRestrictions API.';
        redirectToError(res, message, 'api.defineTimeRestrictions', error);
    }
};
