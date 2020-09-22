import React, { ReactElement } from 'react';
import { TwoThirdsLayout } from '../layout/Layout';

const title = 'Cookie on the Fares Data Build Tool';
const description = 'Cookies Preferences page of the Fares Data Build Tool';

const Cookies = (): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        <h1 className="govuk-heading-l">Cookies on the Fares Data Build Tool</h1>
    </TwoThirdsLayout>
);

export default Cookies;
