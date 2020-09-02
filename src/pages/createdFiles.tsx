import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import startCase from 'lodash/startCase';
import TwoThirdsLayout from '../layout/Layout';
import { getNocFromIdToken } from '../utils';
import { retrieveNetexForNocs, getMatchingDataObject, getNetexSignedUrl } from '../data/s3';
import { S3NetexFile, PeriodTicket, PointToPointTicket, BaseProduct } from '../interfaces';
import {
    isPointToPointTicket,
    isGeoZoneTicket,
    isPeriodTicket,
    isMultipleServicesTicket,
    isNotEmpty,
} from '../interfaces/typeGuards';

const title = 'Created Files - Fares Data Build Tool';
const description = 'Created Files page for the Fares Data Build Tool';

interface CreateFilesProps {
    files: S3NetexFile[];
}

const buildName = (file: PointToPointTicket | PeriodTicket): string => {
    let name = `${file.nocCode} - ${startCase(file.type)} - ${startCase(file.passengerType)}`;

    if (isPointToPointTicket(file)) {
        name += ` - Line ${file.lineName}`;
    } else if (isGeoZoneTicket(file)) {
        name += ` - ${file.zoneName}`;
    }

    return name;
};

const enrichNetexFileData = async (files: AWS.S3.Object[]): Promise<S3NetexFile[]> => {
    const requestPromises = files.map(async file => {
        if (!file.Key) {
            return null;
        }

        const signedUrl = await getNetexSignedUrl(file.Key);

        return {
            matchingData: await getMatchingDataObject(file.Key.replace('.xml', '.json')),
            signedUrl,
        };
    });

    const response = await Promise.all(requestPromises);

    return response
        .map(item => {
            if (!item?.matchingData?.Body) {
                return null;
            }

            const matchingData: PointToPointTicket | PeriodTicket = JSON.parse(item.matchingData.Body.toString());

            return {
                name: buildName(matchingData),
                noc: matchingData.nocCode,
                reference: matchingData.uuid,
                fareType: matchingData.type,
                passengerType: matchingData.passengerType,
                date: item.matchingData.LastModified?.toUTCString() ?? '',
                productNames: isPeriodTicket(matchingData)
                    ? matchingData.products.map(product => product.productName).join(', ')
                    : '',
                serviceNames: isMultipleServicesTicket(matchingData)
                    ? matchingData.selectedServices.map(service => service.lineName).join(', ')
                    : '',
                lineName: isPointToPointTicket(matchingData) ? matchingData.lineName : '',
                zoneName: isGeoZoneTicket(matchingData) ? matchingData.zoneName : '',
                sopNames: (matchingData.products as BaseProduct[])
                    .map(product => product.salesOfferPackages.map(sop => sop.name))
                    .join(', '),
                signedUrl: item.signedUrl,
            };
        })
        .filter(isNotEmpty);
};

const CreatedFiles = ({ files }: CreateFilesProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        <h1 className="govuk-heading-l">Previously created files</h1>
        <div className="govuk-accordion" data-module="govuk-accordion" id="accordion-default">
            {files.map((file, index) => (
                <div className="govuk-accordion__section" key={file.reference}>
                    <div className="govuk-accordion__section-header">
                        <h2 className="govuk-accordion__section-heading">
                            <span className="govuk-accordion__section-button" id={`accordion-default-heading-${index}`}>
                                {file.name}
                            </span>
                        </h2>
                    </div>
                    <div
                        id={`accordion-default-content-${index}`}
                        className="govuk-accordion__section-content"
                        aria-labelledby={`accordion-default-heading-${index}`}
                    >
                        <div className="govuk-body">
                            <span className="govuk-body govuk-!-font-weight-bold">Reference: </span> {file.reference}
                            <br />
                            <span className="govuk-body govuk-!-font-weight-bold">National Operator Code: </span>{' '}
                            {file.noc}
                            <br />
                            <span className="govuk-body govuk-!-font-weight-bold">Fare Type: </span>{' '}
                            {startCase(file.fareType)}
                            <br />
                            <span className="govuk-body govuk-!-font-weight-bold">Passenger Type: </span>{' '}
                            {startCase(file.passengerType)}
                            <br />
                            <span className="govuk-body govuk-!-font-weight-bold">Sales Offer Package(s): </span>{' '}
                            {startCase(file.sopNames)}
                            <br />
                            {file.serviceNames && (
                                <>
                                    <span className="govuk-body govuk-!-font-weight-bold">Service(s): </span>{' '}
                                    {file.serviceNames}
                                    <br />
                                </>
                            )}
                            {file.productNames && (
                                <>
                                    <span className="govuk-body govuk-!-font-weight-bold">Product(s): </span>{' '}
                                    {file.productNames}
                                    <br />
                                </>
                            )}
                            {file.lineName && (
                                <>
                                    <span className="govuk-body govuk-!-font-weight-bold">Line Name: </span>{' '}
                                    {file.lineName}
                                    <br />
                                </>
                            )}
                            {file.zoneName && (
                                <>
                                    <span className="govuk-body govuk-!-font-weight-bold">Zone Name: </span>{' '}
                                    {file.zoneName}
                                    <br />
                                </>
                            )}
                            <span className="govuk-body govuk-!-font-weight-bold">Date of Creation: </span> {file.date}
                            <br />
                            <br />
                            <a href={file.signedUrl} className="govuk-button" download>
                                Download
                            </a>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </TwoThirdsLayout>
);

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: CreateFilesProps } | null> => {
    const nocList = getNocFromIdToken(ctx)?.split('|');

    if (!nocList) {
        throw new Error('no NOCs found in ID token');
    }

    const files = await retrieveNetexForNocs(nocList);
    const filesToEnrich = files
        .sort((a, b) => {
            if (!a.LastModified || !b.LastModified) {
                return 0;
            }

            if (a.LastModified < b.LastModified) {
                return 1;
            }

            if (a.LastModified > b.LastModified) {
                return -1;
            }

            return 0;
        })
        .slice(0, 100);

    return {
        props: {
            files: await enrichNetexFileData(filesToEnrich),
        },
    };
};

export default CreatedFiles;
