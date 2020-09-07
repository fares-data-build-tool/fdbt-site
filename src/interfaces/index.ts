import { AppInitialProps } from 'next/app';
import { NextApiRequest, NextPageContext } from 'next';
import { DocumentContext } from 'next/document';
import { IncomingMessage } from 'http';

export interface BaseReactElement {
    id: string;
    name: string;
    label: string;
}

export interface ProductInfo {
    productName: string;
    productPrice: string;
}

export interface DaysValidInfo {
    daysValid: string;
    errors: ErrorInfo[];
}

export interface PassengerAttributes {
    passengerTypeDisplay: string;
    passengerTypeValue: string;
}

export interface PassengerType {
    passengerType: string;
}

export interface BasicService {
    lineName: string;
    nocCode: string;
    operatorShortName: string;
    serviceDescription: string;
}

export interface ErrorInfo {
    errorMessage: string;
    id: string;
    userInput?: string;
}

export interface InputCheck {
    id: string;
    inputValue: string;
    error: string;
}

export interface InputMethodInfo {
    inputMethod: string;
}

/* eslint-disable camelcase */
export interface CognitoIdToken {
    sub: string;
    aud: string;
    email_verified: boolean;
    event_id: string;
    'custom:noc': string;
    token_use: string;
    auth_time: number;
    iss: string;
    'cognito:username': string;
    exp: number;
    iat: number;
    email: string;
    'custom:contactable': string;
}

export interface CustomAppProps extends AppInitialProps {
    csrfToken: string;
}

export interface Breadcrumb {
    name: string;
    link: string;
    show: boolean;
}

interface Session {
    session: Express.Session;
}

export type NextApiRequestWithSession = NextApiRequest & Session;

export type NextPageContextWithSession = NextPageContext & {
    req: Session;
};

export type DocumentContextWithSession = DocumentContext & {
    req: Session;
};

export type IncomingMessageWithSession = IncomingMessage & Session;

export interface SalesOfferPackageInfo {
    purchaseLocations: string[];
    paymentMethods: string[];
    ticketFormats: string[];
}

export interface SalesOfferPackage extends SalesOfferPackageInfo {
    name: string;
    description: string;
}

export interface SelectSalesOfferPackage {
    selected: { [key: string]: string };
}

export interface Product {
    productName: string;
    productNameId?: string;
    productPrice: string;
    productPriceId?: string;
    productDuration?: string;
    productDurationId?: string;
    productValidity?: string;
    productValidityError?: string;
}

export interface ProductData {
    products: Product[];
}

export interface GroupPassengerTypesCollection {
    passengerTypes: string[];
}

export interface GroupTicketAttribute {
    maxGroupSize: string;
}

export interface CompanionInfo {
    passengerType: string;
    minNumber?: string;
    maxNumber: string;
    ageRangeMin?: string;
    ageRangeMax?: string;
    proofDocuments?: string[];
}

export interface GroupDefinition {
    maxGroupSize: number;
    companions: CompanionInfo[];
}

export interface TimeRestriction {
    startTime?: string;
    endTime?: string;
    validDays?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
}

export interface TimeRestrictionsDefinition extends TimeRestriction {
    timeRestriction?: string;
    validDaysSelected?: string;
}

export interface TimeRestrictionsAttribute {
    timeRestrictions: boolean;
}

interface BaseTicket {
    timeRestriction?: TimeRestriction;
    nocCode: string;
    type: string;
    passengerType: string;
    ageRange?: string;
    ageRangeMin?: string;
    ageRangeMax?: string;
    proof?: string;
    proofDocuments?: string[];
    email: string;
    uuid: string;
}

export type PointToPointTicket = SingleTicket | ReturnTicket;

interface BasePointToPointTicket extends BaseTicket {
    operatorShortName: string;
    lineName: string;
    serviceDescription: string;
    products: BaseProduct[];
}

export interface SingleTicket extends BasePointToPointTicket {
    fareZones: FareZone[];
}

export interface ReturnTicket extends BasePointToPointTicket {
    inboundFareZones: FareZone[];
    outboundFareZones: FareZone[];
}

export interface FareZoneName {
    fareZoneName: string;
}

interface FareZone {
    name: string;
    stops: Stop[];
    prices: FareZonePrices[];
}

interface FareZonePrices {
    price: string;
    fareZones: string[];
}

export type PeriodTicket = PeriodGeoZoneTicket | PeriodMultipleServicesTicket;

export interface FareType {
    fareType: string;
}

interface BasePeriodTicket extends BaseTicket {
    operatorName: string;
    products: ProductDetails[];
}

export interface PeriodGeoZoneTicket extends BasePeriodTicket {
    zoneName: string;
    stops: Stop[];
}

export interface PeriodMultipleServicesTicket extends BasePeriodTicket {
    selectedServices: SelectedService[];
}

export interface FlatFareTicket extends BaseTicket {
    operatorName: string;
    products: FlatFareProductDetails[];
    selectedServices: SelectedService[];
}

export interface SelectedService {
    lineName: string;
    serviceCode: string;
    startDate: string;
    serviceDescription: string;
}

export interface ServiceListAttribute {
    selectedServices: string[];
}

export interface RawJourneyPattern {
    orderedStopPoints: {
        stopPointRef: string;
        commonName: string;
    }[];
}

export interface JourneyPattern {
    startPoint: {
        Id: string;
        Display: string;
    };
    endPoint: {
        Id: string;
        Display: string;
    };
    stopList: string[];
}

export interface ServiceName {
    service: string;
}

export interface Service {
    serviceDescription: string;
    operatorShortName: string;
    journeyPatterns: JourneyPattern[];
}

export interface RawService {
    serviceDescription: string;
    operatorShortName: string;
    journeyPatterns: RawJourneyPattern[];
}

export interface Stop {
    stopName: string;
    naptanCode: string;
    atcoCode: string;
    localityCode: string;
    localityName: string;
    parentLocalityName: string;
    indicator?: string;
    street?: string;
    qualifierName?: string;
}

export interface ServiceType {
    lineName: string;
    startDate: string;
    description: string;
    serviceCode: string;
}

export interface ServicesInfo extends ServiceType {
    checked?: boolean;
}

export interface FareStage {
    stageName: string;
    prices: {
        price: string;
        fareZones: string[];
    }[];
}

export interface FareStagesAttribute {
    fareStages: string;
}

export interface UserFareStages {
    fareStages: FareStage[];
}

export interface UserFareZone {
    FareZoneName: string;
    NaptanCodes: string;
    AtcoCodes: string;
}

export interface FaresInput {
    input: string;
    locator: string;
}

export interface FaresInformation {
    inputs: FaresInput[];
}

export interface OperatorNameType {
    operatorPublicName: string;
    nocCode?: string;
}

export interface BaseProduct {
    salesOfferPackages: SalesOfferPackage[];
}

export interface MultiProduct {
    productName: string;
    productNameId: string;
    productNameError?: string;
    productPrice: string;
    productPriceId: string;
    productPriceError?: string;
    productDuration: string;
    productDurationId: string;
    productDurationError?: string;
}

export interface MultipleProductAttribute {
    products: Product[];
}

export interface BaseMultipleProductAttribute {
    products: MultiProduct[];
}

interface FlatFareProductDetails extends BaseProduct {
    productName: string;
    productPrice: string;
}

export interface ProductDetails extends Product, BaseProduct {}

export interface NumberOfProductsAttribute {
    numberOfProductsInput: string;
}

export interface Journey {
    directionJourneyPattern?: string;
    inboundJourney?: string;
    outboundJourney?: string;
}

export interface PeriodTypeAttribute {
    name: string;
}
export interface S3NetexFile {
    name: string;
    noc: string;
    reference: string;
    fareType: string;
    productNames?: string;
    passengerType: string;
    serviceNames?: string;
    lineName?: string;
    zoneName?: string;
    sopNames: string;
    date: string;
    signedUrl: string;
}

export interface RadioWithoutConditionals extends BaseReactElement {
    value: string;
}

export interface RadioWithConditionalInputs extends RadioWithoutConditionals {
    dataAriaControls: string;
    hint: {
        id: string;
        content: string;
    };
    inputType: string;
    inputs: BaseReactElement[];
    inputErrors: ErrorInfo[];
}

export type RadioButton = RadioWithoutConditionals | RadioWithConditionalInputs;

export interface RadioConditionalInputFieldset {
    heading: {
        id: string;
        content: string;
    };
    radios: RadioButton[];
    radioError: ErrorInfo[];
}

interface Price {
    price: string;
    fareZones: string[];
}

export interface MatchingInfo {
    service: BasicService;
    userFareStages: UserFareStages;
    matchingFareZones: MatchingFareZones;
}

export interface InboundMatchingInfo {
    inboundUserFareStages: UserFareStages;
    inboundMatchingFareZones: MatchingFareZones;
}

export interface MatchingWithErrors {
    error: boolean;
    selectedFareStages: string[];
}

export interface MatchingFareZonesData {
    name: string;
    stops: Stop[];
    prices: Price[];
}

export interface MatchingFareZones {
    [key: string]: MatchingFareZonesData;
}

export type WithErrors<T> = {
    errors: ErrorInfo[];
} & T;
