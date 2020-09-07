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
} from '../constants/index';
import {
    InputMethodInfo,
    IncomingMessageWithSession,
    ProductInfo,
    ProductData,
    GroupDefinition,
    TimeRestriction,
    CompanionInfo,
    DaysValidInfo,
    Journey,
    PeriodTypeAttribute,
    SalesOfferPackage,
    SalesOfferPackageInfo,
    WithErrors,
    InputCheck,
    FareType,
    FareStagesAttribute,
    ServiceName,
    GroupTicketAttribute,
    GroupPassengerTypesCollection,
    BaseMultipleProductAttribute,
    MultipleProductAttribute,
    PassengerType,
    FaresInformation,
    NumberOfProductsAttribute,
    SelectSalesOfferPackage,
    ServiceListAttribute,
    TimeRestrictionsAttribute,
    FareZoneName,
    MatchingInfo,
    MatchingWithErrors,
    InboundMatchingInfo,
} from '../interfaces';

interface SessionAttributeTypes {
    [STAGE_NAMES_ATTRIBUTE]: string[] | InputCheck[];
    [DAYS_VALID_ATTRIBUTE]: DaysValidInfo;
    [INPUT_METHOD_ATTRIBUTE]: InputMethodInfo | WithErrors<{}>;
    [SOP_ATTRIBUTE]: SalesOfferPackage;
    [SOP_INFO_ATTRIBUTE]: SalesOfferPackageInfo | WithErrors<SalesOfferPackageInfo>;
    [MATCHING_ATTRIBUTE]: MatchingWithErrors | MatchingInfo;
    [INBOUND_MATCHING_ATTRIBUTE]: MatchingWithErrors | InboundMatchingInfo;
    [PERIOD_EXPIRY_ATTRIBUTE]: ProductData | WithErrors<ProductData>;
    [PRODUCT_DETAILS_ATTRIBUTE]: ProductInfo | ProductData | WithErrors<ProductInfo>;
    [PRICE_ENTRY_ATTRIBUTE]: FaresInformation | WithErrors<FaresInformation>;
    [SALES_OFFER_PACKAGES_ATTRIBUTE]: SelectSalesOfferPackage | WithErrors<SelectSalesOfferPackage>;
    [GROUP_SIZE_ATTRIBUTE]: GroupTicketAttribute | WithErrors<GroupTicketAttribute>;
    [GROUP_PASSENGER_TYPES_ATTRIBUTE]: GroupPassengerTypesCollection | WithErrors<GroupPassengerTypesCollection>;
    [GROUP_PASSENGER_INFO_ATTRIBUTE]: CompanionInfo[];
    [GROUP_DEFINITION_ATTRIBUTE]: GroupDefinition | WithErrors<GroupDefinition>;
    [TIME_RESTRICTIONS_ATTRIBUTE]: TimeRestrictionsAttribute | WithErrors<TimeRestrictionsAttribute>;
    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: TimeRestriction | WithErrors<TimeRestriction>;
    [FARE_ZONE_ATTRIBUTE]: FareZoneName | WithErrors<{}>;
    [CSV_UPLOAD_ATTRIBUTE]: WithErrors<{}>;
    [SERVICE_LIST_ATTRIBUTE]: ServiceListAttribute | WithErrors<{}>;
    [NUMBER_OF_STAGES_ATTRIBUTE]: WithErrors<{}>;
    [MULTIPLE_PRODUCT_ATTRIBUTE]:
        | BaseMultipleProductAttribute
        | WithErrors<BaseMultipleProductAttribute>
        | MultipleProductAttribute;
    [NUMBER_OF_PRODUCTS_ATTRIBUTE]: NumberOfProductsAttribute | WithErrors<{}>;
    [FARE_TYPE_ATTRIBUTE]: FareType | WithErrors<FareType>;
    [PASSENGER_TYPE_ATTRIBUTE]: PassengerType | WithErrors<PassengerType>;
    [DEFINE_PASSENGER_TYPE_ERRORS_ATTRIBUTE]: PassengerType | WithErrors<PassengerType>;
    [SERVICE_ATTRIBUTE]: ServiceName | WithErrors<ServiceName>;
    [JOURNEY_ATTRIBUTE]: Journey | WithErrors<Journey>;
    [PERIOD_TYPE_ATTRIBUTE]: PeriodTypeAttribute | WithErrors<PeriodTypeAttribute>;
    [FARE_STAGES_ATTRIBUTE]: FareStagesAttribute | WithErrors<FareStagesAttribute>;
}

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
