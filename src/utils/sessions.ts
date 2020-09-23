import { FaresInformation } from '../pages/api/priceEntry';
import {
    DAYS_VALID_ATTRIBUTE,
    PRICE_ENTRY_ATTRIBUTE,
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
    INPUT_METHOD_ATTRIBUTE,
    STAGE_NAMES_ATTRIBUTE,
    FARE_ZONE_ATTRIBUTE,
    CSV_UPLOAD_ATTRIBUTE,
    SERVICE_LIST_ATTRIBUTE,
    NUMBER_OF_STAGES_ATTRIBUTE,
    MULTIPLE_PRODUCT_ATTRIBUTE,
    NUMBER_OF_PRODUCTS_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
    PASSENGER_TYPE_ATTRIBUTE,
    DEFINE_PASSENGER_TYPE_ERRORS_ATTRIBUTE,
    SERVICE_ATTRIBUTE,
    JOURNEY_ATTRIBUTE,
    PERIOD_TYPE_ATTRIBUTE,
    FARE_STAGES_ATTRIBUTE,
    PRODUCT_DATE_ATTRIBUTE,
    RETURN_VALIDITY_ATTRIBUTE,
} from '../constants/index';
import {
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
    Journey,
    JourneyWithErrors,
    PeriodTypeAttribute,
    PeriodTypeAttributeWithErrors,
    SalesOfferPackage,
    ProductWithSalesOfferPackages,
    ReturnPeriodValidity,
} from '../interfaces';

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
import { InputCheck } from '../pages/stageNames';
import { FareZone, FareZoneWithErrors } from '../pages/api/csvZoneUpload';
import { CsvUploadAttributeWithErrors } from '../pages/api/csvUpload';
import { ServiceListAttribute, ServiceListAttributeWithErrors } from '../pages/api/serviceList';
import { NumberOfStagesAttributeWithError } from '../pages/howManyStages';
import { MultipleProductAttribute } from '../pages/api/multipleProductValidity';
import { BaseMultipleProductAttribute, BaseMultipleProductAttributeWithErrors } from '../pages/api/multipleProducts';
import { NumberOfProductsAttribute, NumberOfProductsAttributeWithErrors } from '../pages/api/howManyProducts';
import { FareType, FareTypeWithErrors } from '../pages/api/fareType';
import { PassengerTypeWithErrors, PassengerType } from '../pages/api/passengerType';
import { DefinePassengerTypeWithErrors } from '../pages/api/definePassengerType';
import { ServiceWithErrors, Service } from '../pages/api/service';
import { FareStagesAttribute, FareStagesAttributeWithErrors } from '../pages/api/chooseStages';
import { ProductDate, ProductDatesWithErrors } from '../pages/api/productDateInformation';
import { ReturnPeriodValidityWithErrors } from '../pages/returnValidity';

type SessionAttributeTypes = {
    [STAGE_NAMES_ATTRIBUTE]: string[] | InputCheck[];
    [DAYS_VALID_ATTRIBUTE]: DaysValidInfo;
    [INPUT_METHOD_ATTRIBUTE]: InputMethodInfo | ErrorInfo;
    [SOP_ATTRIBUTE]: SalesOfferPackageWithErrors;
    [SOP_INFO_ATTRIBUTE]: SalesOfferPackageInfo | SalesOfferPackageInfoWithErrors;
    [MATCHING_ATTRIBUTE]: MatchingWithErrors | MatchingInfo;
    [INBOUND_MATCHING_ATTRIBUTE]: MatchingWithErrors | InboundMatchingInfo;
    [PERIOD_EXPIRY_ATTRIBUTE]: PeriodExpiryWithErrors | ProductData;
    [PRODUCT_DETAILS_ATTRIBUTE]: ProductInfo | ProductData | ProductInfoWithErrors;
    [PRICE_ENTRY_ATTRIBUTE]: FaresInformation;
    [SALES_OFFER_PACKAGES_ATTRIBUTE]:
        | SelectSalesOfferPackageWithError
        | SalesOfferPackage[]
        | ProductWithSalesOfferPackages[]
        | undefined;
    [GROUP_SIZE_ATTRIBUTE]: GroupTicketAttribute | GroupTicketAttributeWithErrors;
    [GROUP_PASSENGER_TYPES_ATTRIBUTE]: GroupPassengerTypesCollection | GroupPassengerTypesCollectionWithErrors;
    [GROUP_PASSENGER_INFO_ATTRIBUTE]: CompanionInfo[];
    [GROUP_DEFINITION_ATTRIBUTE]: GroupDefinition | GroupDefinitionWithErrors;
    [TIME_RESTRICTIONS_ATTRIBUTE]: TimeRestrictionsAttribute | TimeRestrictionsAttributeWithErrors;
    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: TimeRestriction | TimeRestrictionsDefinitionWithErrors;
    [FARE_ZONE_ATTRIBUTE]: FareZone | FareZoneWithErrors;
    [CSV_UPLOAD_ATTRIBUTE]: CsvUploadAttributeWithErrors;
    [SERVICE_LIST_ATTRIBUTE]: ServiceListAttribute | ServiceListAttributeWithErrors;
    [NUMBER_OF_STAGES_ATTRIBUTE]: NumberOfStagesAttributeWithError;
    [MULTIPLE_PRODUCT_ATTRIBUTE]:
        | BaseMultipleProductAttribute
        | BaseMultipleProductAttributeWithErrors
        | MultipleProductAttribute;
    [NUMBER_OF_PRODUCTS_ATTRIBUTE]: NumberOfProductsAttribute | NumberOfProductsAttributeWithErrors;
    [FARE_TYPE_ATTRIBUTE]: FareType | FareTypeWithErrors;
    [PASSENGER_TYPE_ATTRIBUTE]: PassengerType | PassengerTypeWithErrors;
    [DEFINE_PASSENGER_TYPE_ERRORS_ATTRIBUTE]: PassengerType | DefinePassengerTypeWithErrors;
    [SERVICE_ATTRIBUTE]: Service | ServiceWithErrors;
    [JOURNEY_ATTRIBUTE]: Journey | JourneyWithErrors;
    [PERIOD_TYPE_ATTRIBUTE]: PeriodTypeAttribute | PeriodTypeAttributeWithErrors;
    [FARE_STAGES_ATTRIBUTE]: FareStagesAttribute | FareStagesAttributeWithErrors;
    [RETURN_VALIDITY_ATTRIBUTE]: ReturnPeriodValidity | ReturnPeriodValidityWithErrors;
    [PRODUCT_DATE_ATTRIBUTE]: ProductDate | ProductDatesWithErrors;
};

type SessionAttribute<T extends string> = T extends keyof SessionAttributeTypes ? SessionAttributeTypes[T] : string;

export const getSessionAttribute = <T extends string>(
    req: IncomingMessageWithSession,
    attributeName: T,
): SessionAttribute<T> | undefined => req?.session?.[attributeName];

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
