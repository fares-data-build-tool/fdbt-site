import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import TwoThirdsLayout from '../layout/Layout';
import { getAttributeFromIdToken } from '../utils';
import { retrieveNetexForNoc } from '../data/s3';
import { S3NetexFile } from '../interfaces';

const title = 'Created Files - Fares Data Build Tool';
const description = 'Created Files page for the Fares Data Build Tool';

interface CreateFilesProps {
    files: S3NetexFile[];
}

const CreatedFiles = ({ files }: CreateFilesProps): ReactElement => {
    return (
        <TwoThirdsLayout title={title} description={description}>
            <h1 className="govuk-heading-l">Previously created files</h1>
            <div className="govuk-accordion" data-module="govuk-accordion" id="accordion-default">
                {files.map((file, index) => (
                    <div className="govuk-accordion__section" key={file.name}>
                        <div className="govuk-accordion__section-header">
                            <h2 className="govuk-accordion__section-heading">
                                <span
                                    className="govuk-accordion__section-button"
                                    id={`accordion-default-heading-${index}`}
                                >
                                    {file.name}
                                </span>
                            </h2>
                        </div>
                        <div
                            id={`accordion-default-content-${index}`}
                            className="govuk-accordion__section-content"
                            aria-labelledby={`accordion-default-heading-${index}`}
                        >
                            <p className="govuk-body">HELLO</p>
                        </div>
                    </div>
                ))}
            </div>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<{ props: CreateFilesProps }> => {
    const noc = getAttributeFromIdToken(ctx, 'custom:noc');

    const files = await retrieveNetexForNoc(noc || '');

    return {
        props: {
            files,
        },
    };
};

export default CreatedFiles;
