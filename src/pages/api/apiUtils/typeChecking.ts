import { FareType, FareTypeWithErrors } from '../fareType';
import { Service, ServiceWithErrors } from '../service';

export const isFareTypeAttributeWithErrors = (
    fareTypeAttribute: FareType | FareTypeWithErrors,
): fareTypeAttribute is FareTypeWithErrors => (fareTypeAttribute as FareTypeWithErrors).errors !== undefined;

export const isFareType = (fareType: FareType | FareTypeWithErrors | undefined): fareType is FareType => {
    return fareType !== undefined && (fareType as FareType).fareType !== undefined;
};

export const isServiceAttributeWithErrors = (
    serviceAttribute: Service | ServiceWithErrors,
): serviceAttribute is ServiceWithErrors => (serviceAttribute as ServiceWithErrors).errors !== undefined;

export const isService = (service: Service | ServiceWithErrors | undefined): service is Service => {
    return service !== undefined && (service as Service).service !== undefined;
};
