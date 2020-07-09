/* eslint-disable react/jsx-props-no-spreading */
import React, { ReactElement } from 'react';
import { parseCookies } from 'nookies';
import { NextContextWithSession, CustomAppProps } from '../interfaces';
import { BaseLayout } from '../layout/Layout';
import UserDataUploadComponent, { UserDataUploadsProps } from '../components/UserDataUploads';
import { CSV_ZONE_UPLOAD_ATTRIBUTE } from '../constants';
import { deleteCookieOnServerSide } from '../utils';
import FareZoneExampleCsv from '../assets/files/Fare-Zone-Example.csv';
import HowToUploadFareZone from '../assets/files/How-to-Upload-a-Fare-Zone.pdf';

const title = 'CSV Zone Upload - Fares Data Build Tool';
const description = 'CSV Zone Upload page of the Fares Data Build Tool';

const errorId = 'csv-upload-error';

const CsvZoneUpload = (uploadProps: UserDataUploadsProps & CustomAppProps): ReactElement => (
    <BaseLayout title={title} description={description} errors={uploadProps.errors}>
        <UserDataUploadComponent
            {...uploadProps}
            detailBody={
                <>
                    <p>Some common issues with csv uploads include:</p>
                    <ul className="govuk-list govuk-list--bullet">
                        <li>Commas in fare zone names</li>
                    </ul>
                    <p>
                        Use the help file document for a more detailed help on constructing a fare zone csv in the
                        required format or download the csv template to create a new file.
                    </p>
                </>
            }
        />
    </BaseLayout>
);

export const getServerSideProps = (ctx: NextContextWithSession): { props: UserDataUploadsProps } => {
    const cookies = parseCookies(ctx);
    const csvZoneUploadCookie = cookies[CSV_ZONE_UPLOAD_ATTRIBUTE];

    let csvZoneUpload;

    if (csvZoneUploadCookie) {
        csvZoneUpload = JSON.parse(csvZoneUploadCookie);
        if (csvZoneUpload.error === undefined) {
            csvZoneUpload.error = '';
        }
    }

    const uploadProps = {
        props: {
            csvUploadApiRoute: '/api/csvZoneUpload',
            csvUploadHintText:
                'Upload a fare zone as a csv file below. Refer to the documents section to download a help file and a template.',
            guidanceDocDisplayName: 'Download Help File',
            guidanceDocAttachmentUrl: HowToUploadFareZone,
            guidanceDocSize: '1.0MB',
            csvTemplateDisplayName: 'Download fare zone csv template',
            csvTemplateAttachmentUrl: FareZoneExampleCsv,
            csvTemplateSize: '600B',
            errors: !csvZoneUpload?.error ? [] : [{ errorMessage: csvZoneUpload.error, id: errorId }],
            detailSummary: "My csv won't upload",
        },
    };

    if (csvZoneUpload?.error) {
        deleteCookieOnServerSide(ctx, CSV_ZONE_UPLOAD_ATTRIBUTE);
    }

    return uploadProps;
};

export default CsvZoneUpload;
