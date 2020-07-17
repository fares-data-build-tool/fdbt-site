import { NextApiRequest } from 'next';
import { MATCHING_DATA_BUCKET_NAME } from '../../../constants';
import { UserFareStages, putStringInS3 } from '../../../data/s3';
import { Stop } from '../../../data/auroradb';
import {
    MatchingFareZones,
    MatchingFareZonesData,
    MatchingData,
    MatchingReturnData,
    MatchingPeriodData,
} from '../../../interfaces/matchingInterface';
import { BasicService, PassengerDetails, ServicesInfo, SalesOfferPackage, Product } from '../../../interfaces';

export const getFareZones = (
    userFareStages: UserFareStages,
    matchingFareZones: MatchingFareZones,
): MatchingFareZonesData[] => {
    return userFareStages.fareStages
        .filter(userStage => matchingFareZones[userStage.stageName])
        .map(userStage => {
            const matchedZone = matchingFareZones[userStage.stageName];

            return {
                name: userStage.stageName,
                stops: matchedZone.stops.map((stop: Stop) => ({
                    ...stop,
                    qualifierName: '',
                })),
                prices: userStage.prices,
            };
        });
};

export const getMatchingFareZonesFromForm = (req: NextApiRequest): MatchingFareZones => {
    const matchingFareZones: MatchingFareZones = {};
    const bodyValues: string[] = Object.values(req.body);

    bodyValues.forEach((zoneString: string) => {
        if (zoneString && typeof zoneString === 'string') {
            const zone = JSON.parse(zoneString);

            if (matchingFareZones[zone.stage]) {
                matchingFareZones[zone.stage].stops.push(zone.stop);
            } else {
                matchingFareZones[zone.stage] = {
                    name: zone.stage,
                    stops: [zone.stop],
                    prices: [zone.price],
                };
            }
        }
    });

    if (Object.keys(matchingFareZones).length === 0) {
        throw new Error('No Stops allocated to fare stages');
    }

    return matchingFareZones;
};

export const putMatchingDataInS3 = async (
    data: MatchingData | MatchingReturnData | MatchingFareZones,
    uuid: string,
): Promise<void> => {
    await putStringInS3(
        MATCHING_DATA_BUCKET_NAME,
        `${data.nocCode}/${data.type}/${uuid}_${Date.now()}.json`,
        JSON.stringify(data),
        'application/json; charset=utf-8',
    );
};

export const isFareStageUnassigned = (userFareStages: UserFareStages, matchingFareZones: MatchingFareZones): boolean =>
    userFareStages.fareStages.some(stage => !matchingFareZones[stage.stageName]);

export const getMatchingJson = (
    service: BasicService,
    userFareStages: UserFareStages,
    inboundUserFareStages: UserFareStages,
    matchingFareZones: MatchingFareZones,
    inboundMatchingFareZones: MatchingFareZones,
    fareType: string,
    passengerTypeObject: PassengerDetails,
    email: string,
    uuid: string,
    operatorName: string,
    nocCode: string | null,
    products: Product[],
    salesOfferPackages: SalesOfferPackage[],
    selectedServices?: ServicesInfo[],
    zoneName?: string,
    stops?: Stop[],
): MatchingData | MatchingReturnData | MatchingPeriodData | {} => {
    if (fareType === 'single') {
        return {
            ...service,
            type: 'single',
            fareZones: getFareZones(userFareStages, matchingFareZones),
            ...passengerTypeObject,
            email,
            uuid,
            ...salesOfferPackages,
        };
    }
    if (fareType === 'return') {
        return {
            ...service,
            type: 'return',
            outboundFareZones: getFareZones(userFareStages, matchingFareZones),
            inboundFareZones: getFareZones(inboundUserFareStages, inboundMatchingFareZones),
            ...passengerTypeObject,
            email,
            uuid,
            ...salesOfferPackages,
        };
    }
    if (fareType === 'period') {
        return {
            operatorName,
            type: 'period',
            nocCode,
            email,
            uuid,
            products,
            ...passengerTypeObject,
            ...selectedServices,
            zoneName,
            ...stops,
            ...salesOfferPackages,
        };
    }
    return {};
};

// let props = {};

// if (fareZoneCookie) {
//     const { fareZoneName } = JSON.parse(fareZoneCookie);
//     const atcoCodes: string[] = await getCsvZoneUploadData(uuid);
//     const zoneStops: Stop[] = await batchGetStopsByAtcoCode(atcoCodes);

//     if (zoneStops.length === 0) {
//         throw new Error(`No stops found for atcoCodes: ${atcoCodes}`);
//     }

//     props = {
//         zoneName: fareZoneName,
//         stops: zoneStops,
//     };
// }

// if (serviceListCookie) {
//     const { selectedServices } = JSON.parse(serviceListCookie);
//     const formattedServiceInfo: ServicesInfo[] = selectedServices.map((selectedService: string) => {
//         const service = selectedService.split('#');
//         return {
//             lineName: service[0],
//             serviceCode: service[1],
//             startDate: service[2],
//             serviceDescription: service[3],
//         };
//     });
//     props = {
//         selectedServices: formattedServiceInfo,
//     };
// }

// if (fareType === 'period') {
//     const validInputs = JSON.stringify(productDetails);
//     setCookieOnResponseObject(PRODUCT_DETAILS_ATTRIBUTE, validInputs, req, res);
//     redirectTo(res, '/chooseValidity');
// } else if (fareType === 'flatFare') {
//     const operatorCookie = unescapeAndDecodeCookie(cookies, OPERATOR_COOKIE);
//     const serviceListCookie = unescapeAndDecodeCookie(cookies, SERVICE_LIST_COOKIE);
//     const passengerTypeCookie = unescapeAndDecodeCookie(cookies, PASSENGER_TYPE_COOKIE);
//     const nocCode = getNocFromIdToken(req, res);

//     if (!serviceListCookie || !passengerTypeCookie || !nocCode) {
//         throw new Error('Necessary cookies not found for productDetails API');
//     }

//     const { operator, uuid } = JSON.parse(operatorCookie);
//     const { selectedServices } = JSON.parse(serviceListCookie);
//     const passengerTypeObject: PassengerDetails = JSON.parse(passengerTypeCookie);
//     const formattedServiceInfo: ServicesInfo[] = selectedServices.map((selectedService: string) => {
//         const service = selectedService.split('#');
//         return {
//             lineName: service[0],
//             serviceCode: service[1],
//             startDate: service[2],
//             serviceDescription: service[3],
//         };
//     });

// const products: Product[] = [
//     {
//         productName,
//         productPrice,
//         productDuration: daysValid,
//         productValidity: periodValid,
//     },
// ];
