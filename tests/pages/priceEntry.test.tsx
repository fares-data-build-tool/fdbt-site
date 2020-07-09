import * as React from 'react';
import { shallow } from 'enzyme';
import { mockRequest } from 'mock-req-res';
import MockRes from 'mock-res';
import { NextPageContext } from 'next';
import PriceEntry, { getServerSideProps } from '../../src/pages/priceEntry';
import { STAGE_NAMES_ATTRIBUTE } from '../../src/constants';

const mockFareStages: string[] = [
    'Briggate',
    'Chapeltown',
    'Chapel Allerton',
    'Moortown',
    'Harrogate Road',
    'Harehills',
    'Gipton',
    'Armley',
    'Stanningley',
    'Pudsey',
    'Seacroft',
    'Rothwell',
    'Dewsbury',
    'Wakefield',
];

describe('Price Entry Page', () => {
    const stageNames = ['Bewbush', 'Chorlton', 'Green Lane', 'Ashbury'];

    it('should render correctly', () => {
        const tree = shallow(<PriceEntry stageNamesArray={mockFareStages} csrfToken="" pageProps={[]} />);
        expect(tree).toMatchSnapshot();
    });

    it('throws error if stage names cookie does not exist', () => {
        const mockStageNamesCookieBody =
            '%7B%22operator%22%3A%22MCT%22%2C%22uuid%22%3A%223f8d5a32-b480-4370-be9a-60d366422a87%22%7D';
        const mockWriteHeadFn = jest.fn();
        const mockEndFn = jest.fn();
        const res = new MockRes();
        res.writeHead = mockWriteHeadFn;
        res.end = mockEndFn;

        const req = mockRequest({
            connection: {
                encrypted: true,
            },
            headers: {
                host: 'localhost:5000',
                cookie: `othername=${mockStageNamesCookieBody}`,
            },
            cookies: {
                STAGE_NAMES_ATTRIBUTE: stageNames,
            },
        });
        const ctx: NextPageContext = {
            res,
            req,
            pathname: '',
            query: {},
            AppTree: () => <div />,
        };

        expect(() => getServerSideProps(ctx)).toThrowError();
    });

    it('throws error if no stage names can be found', () => {
        const mockStageNamesCookieBody = '';
        const mockWriteHeadFn = jest.fn();
        const mockEndFn = jest.fn();
        const res = new MockRes();
        res.writeHead = mockWriteHeadFn;
        res.end = mockEndFn;

        const req = mockRequest({
            connection: {
                encrypted: true,
            },
            headers: {
                host: 'localhost:5000',
                cookie: `${STAGE_NAMES_ATTRIBUTE}=${mockStageNamesCookieBody}`,
            },
            cookies: {
                STAGE_NAMES_ATTRIBUTE: stageNames,
            },
        });
        const ctx: NextPageContext = {
            res,
            req,
            pathname: '',
            query: {},
            AppTree: () => <div />,
        };

        expect(() => getServerSideProps(ctx)).toThrowError();
    });
});
