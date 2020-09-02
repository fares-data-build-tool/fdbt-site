import { FareType, FareTypeWithErrors } from '../fareType';
import { InputMethodInfo, ErrorInfo } from '../../../interfaces';
import { PassengerType, PassengerTypeWithErrors } from '../passengerType';

export const isFareTypeAttributeWithErrors = (
    fareTypeAttribute: FareType | FareTypeWithErrors,
): fareTypeAttribute is FareTypeWithErrors => (fareTypeAttribute as FareTypeWithErrors).errors !== undefined;

export const isFareType = (fareType: FareType | FareTypeWithErrors | undefined): fareType is FareType => {
    return fareType !== undefined && (fareType as FareType).fareType !== undefined;
};

export const inputMethodErrorsExist = (
    inputMethodAttribute: InputMethodInfo | ErrorInfo | undefined,
): inputMethodAttribute is ErrorInfo => (inputMethodAttribute as ErrorInfo)?.errorMessage !== undefined;
export const isPassengerTypeAttributeWithErrors = (
    fareTypeAttribute: PassengerType | PassengerTypeWithErrors,
): fareTypeAttribute is PassengerTypeWithErrors => (fareTypeAttribute as PassengerTypeWithErrors).errors !== undefined;

export const isPassengerType = (
    passengerType: PassengerType | PassengerTypeWithErrors | undefined,
): passengerType is PassengerType => {
    return passengerType !== undefined && (passengerType as PassengerType).passengerType !== undefined;
};
