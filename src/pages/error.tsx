import React, { ReactElement } from 'react';
import Error from './_error';
import { NextContextWithSession } from '../interfaces';

interface ErrorProps {
    statusCode: number;
}

const ErrorPage = ({ statusCode }: ErrorProps): ReactElement => <Error statusCode={statusCode} />;

export const getServerSideProps = (ctx: NextContextWithSession): {} => {
    return { props: { statusCode: ctx?.res?.statusCode } };
};

export default ErrorPage;
