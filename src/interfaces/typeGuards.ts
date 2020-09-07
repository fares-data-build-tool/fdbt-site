import {
    PeriodTicket,
    PointToPointTicket,
    PeriodMultipleServicesTicket,
    FlatFareTicket,
    PeriodGeoZoneTicket,
    ProductData,
    ProductInfo,
    ProductDetails,
    Product,
    RadioWithConditionalInputs,
    RadioWithoutConditionals,
    InputCheck,
    WithErrors,
    SalesOfferPackage,
    SalesOfferPackageInfo,
    InboundMatchingInfo,
    MatchingWithErrors,
    MatchingInfo,
} from '.';

export const isNotEmpty = <T>(value: T | null | undefined): value is T => value !== null && value !== undefined;

export const isPeriodTicket = (ticket: PeriodTicket | PointToPointTicket): ticket is PeriodTicket =>
    (ticket as PeriodTicket).products?.[0]?.productName !== undefined;

export const isMultipleServicesTicket = (
    ticket: PeriodTicket | PointToPointTicket,
): ticket is PeriodMultipleServicesTicket | FlatFareTicket =>
    (ticket as PeriodMultipleServicesTicket).selectedServices !== undefined;

export const isPointToPointTicket = (ticket: PeriodTicket | PointToPointTicket): ticket is PointToPointTicket =>
    (ticket as PointToPointTicket).lineName !== undefined;

export const isGeoZoneTicket = (ticket: PeriodTicket | PointToPointTicket): ticket is PeriodGeoZoneTicket =>
    (ticket as PeriodGeoZoneTicket).zoneName !== undefined;

export const isInputCheck = (stageNamesInfo: string[] | InputCheck[] | undefined): stageNamesInfo is InputCheck[] =>
    stageNamesInfo !== undefined && (stageNamesInfo[0] as InputCheck).error !== undefined;

export const isRadioWithConditionalInputs = (
    radioButton: RadioWithConditionalInputs | RadioWithoutConditionals,
): radioButton is RadioWithConditionalInputs => {
    return (radioButton as RadioWithConditionalInputs).hint !== undefined;
};

export const isMatchingWithErrors = (
    matchingAttribute: MatchingInfo | InboundMatchingInfo | MatchingWithErrors,
): matchingAttribute is MatchingWithErrors => (matchingAttribute as MatchingWithErrors)?.error;

export const isMatchingInfo = (
    matchingAttributeInfo: MatchingInfo | MatchingWithErrors,
): matchingAttributeInfo is MatchingInfo => (matchingAttributeInfo as MatchingInfo)?.service !== null;

export const isInboundMatchingInfo = (
    inboundMatchingAttributeInfo: InboundMatchingInfo | MatchingWithErrors,
): inboundMatchingAttributeInfo is InboundMatchingInfo =>
    (inboundMatchingAttributeInfo as InboundMatchingInfo)?.inboundUserFareStages !== null;

export const isPeriodProductDetails = (product: Product): product is ProductDetails =>
    (product as ProductDetails)?.productDuration !== undefined &&
    (product as ProductDetails)?.productValidity !== undefined;

export const isProductInfo = (
    productDetailsAttribute: ProductInfo | ProductData | undefined,
): productDetailsAttribute is ProductInfo => (productDetailsAttribute as ProductInfo)?.productName !== undefined;

export const isProductData = (
    periodExpiryAttributeInfo: ProductData | ProductInfo,
): periodExpiryAttributeInfo is ProductData => (periodExpiryAttributeInfo as ProductData)?.products !== null;

export const isSalesOfferPackage = (value: SalesOfferPackage | SalesOfferPackageInfo): value is SalesOfferPackage =>
    (value as SalesOfferPackage).name !== undefined;

export const isWithErrors = <T>(value: T): value is WithErrors<T> =>
    !!value && (value as WithErrors<T>).errors !== undefined && (value as WithErrors<T>).errors.length > 0;
