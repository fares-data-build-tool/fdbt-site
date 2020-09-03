import { FareType, FareTypeWithErrors } from '../fareType';
import { InputMethodInfo, ErrorInfo, Journey, JourneyWithErrors } from '../../../interfaces';
import { PassengerType, PassengerTypeWithErrors } from '../passengerType';
import { Service, ServiceWithErrors } from '../service';

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

export const isServiceAttributeWithErrors = (
    serviceAttribute: Service | ServiceWithErrors,
): serviceAttribute is ServiceWithErrors => (serviceAttribute as ServiceWithErrors).errors !== undefined;

export const isService = (service: Service | ServiceWithErrors | undefined): service is Service => {
    return service !== undefined && (service as Service).service !== undefined;
};

export const isJourneyAttributeWithErrors = (
    journeyAttribute: Journey | JourneyWithErrors,
): journeyAttribute is JourneyWithErrors => (journeyAttribute as JourneyWithErrors).errors !== undefined;

export const isJourney = (journey: Journey | JourneyWithErrors | undefined): journey is Journey => {
    return (
        journey !== undefined &&
        ((journey as Journey).directionJourneyPattern !== undefined ||
            (journey as Journey).inboundJourney !== undefined ||
            (journey as Journey).outboundJourney !== undefined ||
            (journey as Journey).errors !== undefined)
    );
};
