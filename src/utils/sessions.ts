import {
    TIME_RESTRICTIONS_ATTRIBUTE,
    SALES_OFFER_PACKAGES_ATTRIBUTE,
    SOP_ATTRIBUTE,
    SOP_INFO_ATTRIBUTE,
    MATCHING_ATTRIBUTE,
    INBOUND_MATCHING_ATTRIBUTE,
    PERIOD_EXPIRY_ATTRIBUTE,
    PRODUCT_DETAILS_ATTRIBUTE,
    GROUP_SIZE_ATTRIBUTE,
    GROUP_PASSENGER_TYPES_ATTRIBUTE,
    GROUP_DEFINITION_ATTRIBUTE,
    GROUP_PASSENGER_INFO_ATTRIBUTE,
    TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
    INPUT_METHOD_ATTRIBUTE,
    PASSENGER_TYPE_ATTRIBUTE,
    DEFINE_PASSENGER_TYPE_ERRORS_ATTRIBUTE,
    DAYS_VALID_ATTRIBUTE,
    JOURNEY_ATTRIBUTE,
    SERVICE_ATTRIBUTE,
    PERIOD_TYPE_ATTRIBUTE,
    STAGE_NAMES_ATTRIBUTE,
} from '../constants/index';
import {
    Journey,
    JourneyWithErrors,
    InputMethodInfo,
    ErrorInfo,
    IncomingMessageWithSession,
    ProductInfo,
    ProductData,
    ProductInfoWithErrors,
    GroupDefinition,
    TimeRestriction,
    CompanionInfo,
    DaysValidInfo,
    PeriodTypeAttribute,
    PeriodTypeAttributeWithErrors,
} from '../interfaces/index';

import { SalesOfferPackageInfo, SalesOfferPackageInfoWithErrors } from '../pages/api/salesOfferPackages';
import { SalesOfferPackageWithErrors } from '../pages/api/describeSalesOfferPackage';
import { MatchingInfo, MatchingWithErrors, InboundMatchingInfo } from '../interfaces/matchingInterface';
import { PeriodExpiryWithErrors } from '../pages/api/periodValidity';
import { SelectSalesOfferPackageWithError } from '../pages/api/selectSalesOfferPackage';
import { GroupTicketAttribute, GroupTicketAttributeWithErrors } from '../pages/api/groupSize';
import {
    GroupPassengerTypesCollection,
    GroupPassengerTypesCollectionWithErrors,
} from '../pages/api/groupPassengerTypes';
import { GroupDefinitionWithErrors } from '../pages/definePassengerType';
import { TimeRestrictionsDefinitionWithErrors } from '../pages/api/defineTimeRestrictions';
import { TimeRestrictionsAttributeWithErrors, TimeRestrictionsAttribute } from '../pages/api/timeRestrictions';
import { FareType, FareTypeWithErrors } from '../pages/api/fareType';
import { PassengerType, PassengerTypeWithErrors } from '../pages/api/passengerType';
import { DefinePassengerTypeWithErrors } from '../pages/api/definePassengerType';
import { Service, ServiceWithErrors } from '../pages/api/service';
import { InputCheck } from '../pages/stageNames';

type SessionAttributeTypes = {
    [STAGE_NAMES_ATTRIBUTE]: string[] | InputCheck[] | undefined;
    [DAYS_VALID_ATTRIBUTE]: DaysValidInfo;
    [INPUT_METHOD_ATTRIBUTE]: InputMethodInfo | ErrorInfo;
    [SOP_ATTRIBUTE]: SalesOfferPackageWithErrors;
    [SOP_INFO_ATTRIBUTE]: SalesOfferPackageInfo | SalesOfferPackageInfoWithErrors;
    [MATCHING_ATTRIBUTE]: MatchingWithErrors | MatchingInfo;
    [INBOUND_MATCHING_ATTRIBUTE]: MatchingWithErrors | InboundMatchingInfo;
    [PERIOD_EXPIRY_ATTRIBUTE]: PeriodExpiryWithErrors | ProductData;
    [PRODUCT_DETAILS_ATTRIBUTE]: ProductInfo | ProductData | ProductInfoWithErrors;
    [SALES_OFFER_PACKAGES_ATTRIBUTE]: SelectSalesOfferPackageWithError;
    [GROUP_SIZE_ATTRIBUTE]: GroupTicketAttribute | GroupTicketAttributeWithErrors;
    [GROUP_PASSENGER_TYPES_ATTRIBUTE]: GroupPassengerTypesCollection | GroupPassengerTypesCollectionWithErrors;
    [GROUP_PASSENGER_INFO_ATTRIBUTE]: CompanionInfo[];
    [GROUP_DEFINITION_ATTRIBUTE]: GroupDefinition | GroupDefinitionWithErrors;
    [TIME_RESTRICTIONS_ATTRIBUTE]: TimeRestrictionsAttribute | TimeRestrictionsAttributeWithErrors;
    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: TimeRestriction | TimeRestrictionsDefinitionWithErrors;
    [FARE_TYPE_ATTRIBUTE]: FareType | FareTypeWithErrors;
    [PASSENGER_TYPE_ATTRIBUTE]: PassengerType | PassengerTypeWithErrors;
    [DEFINE_PASSENGER_TYPE_ERRORS_ATTRIBUTE]: PassengerType | DefinePassengerTypeWithErrors;
    [SERVICE_ATTRIBUTE]: Service | ServiceWithErrors;
    [JOURNEY_ATTRIBUTE]: Journey | JourneyWithErrors;
    [PERIOD_TYPE_ATTRIBUTE]: PeriodTypeAttribute | PeriodTypeAttributeWithErrors;
};

type SessionAttribute<T extends string> = T extends keyof SessionAttributeTypes ? SessionAttributeTypes[T] : string;

export const getSessionAttribute = <T extends string>(
    req: IncomingMessageWithSession,
    attributeName: T,
): SessionAttribute<T> => req?.session?.[attributeName];

export const updateSessionAttribute = <T extends string>(
    req: IncomingMessageWithSession,
    attributeName: T,
    attributeValue: SessionAttribute<T> | undefined,
): void => {
    req.session[attributeName] = attributeValue;
};

export const destroySession = (req: IncomingMessageWithSession): void => {
    req.session.destroy(err => {
        if (err) {
            throw new Error('Could not destroy session');
        }
    });
};
