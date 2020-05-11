import React, { ReactElement } from 'react';
import { NextPageContext } from 'next';
import Error from './_error';

interface ErrorPageProps {
    error: boolean;
}

const ErrorPage = ({ error }: ErrorPageProps): ReactElement => <Error error={error} />;

export const getServerSideProps = (ctx: NextPageContext): {} => {
    return { props: { statusCode: ctx?.res?.statusCode } };
};

export default ErrorPage;
