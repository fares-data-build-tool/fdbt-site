import { isArray } from 'lodash';
import { NextApiResponse } from 'next';
import { NextApiRequestWithSession, ErrorInfo } from '../../interfaces/index';
import { updateSessionAttribute } from '../../utils/sessions';
import { redirectToError, redirectTo } from './apiUtils/index';
import { GROUP_PASSENGER_TYPES_ATTRIBUTE } from '../../constants/index';

export interface GroupPassengerTypesCollection {
    passengerTypes: string[];
}
export interface GroupPassengerTypesCollectionWithErrors {
    errors: ErrorInfo[];
}

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        const chosenPassengerTypes = req.body.passengerTypes;
        if (chosenPassengerTypes) {
            if (isArray(chosenPassengerTypes) && chosenPassengerTypes.length > 2) {
                const passengerTypeErrorMessage: GroupPassengerTypesCollectionWithErrors = {
                    errors: [
                        {
                            errorMessage: 'Choose one or two passenger types - you cannot exceed this limit',
                            id: 'passenger-type-0',
                        },
                    ],
                };
                updateSessionAttribute(req, GROUP_PASSENGER_TYPES_ATTRIBUTE, passengerTypeErrorMessage);
                redirectTo(res, '/groupPassengerTypes');
                return;
            }

            const passengerTypes: string[] = [];

            if (!isArray(chosenPassengerTypes)) {
                passengerTypes.push(chosenPassengerTypes);
            } else {
                chosenPassengerTypes.forEach(passenger => {
                    passengerTypes.push(passenger);
                });
            }
            updateSessionAttribute(req, GROUP_PASSENGER_TYPES_ATTRIBUTE, { passengerTypes });
            redirectTo(res, `/definePassengerType?n=0`);
            return;
        }

        const passengerTypeErrorMessage: GroupPassengerTypesCollectionWithErrors = {
            errors: [{ errorMessage: 'Choose one or two passenger types from the options', id: 'passenger-type-0' }],
        };

        updateSessionAttribute(req, GROUP_PASSENGER_TYPES_ATTRIBUTE, passengerTypeErrorMessage);
        redirectTo(res, '/groupPassengerTypes');
    } catch (error) {
        const message = 'There was a problem selecting the passenger types:';
        redirectToError(res, message, 'api.groupPassengerTypes', error);
    }
};
