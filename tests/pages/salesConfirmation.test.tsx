import * as React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment';
import SalesConfirmation, { buildSalesConfirmationElements } from '../../src/pages/salesConfirmation';

describe('pages', () => {
    describe('confirmation', () => {
        it('should render correctly', () => {
            const tree = shallow(
                <SalesConfirmation
                    salesOfferPackages={[
                        {
                            name: 'A sales offer package',
                            description: 'my way of selling tickets',
                            purchaseLocations: ['at stop', 'website'],
                            paymentMethods: ['cash'],
                            ticketFormats: ['paper'],
                        },
                    ]}
                    ticketDating={{
                        productDates: {
                            startDate: moment().toISOString(),
                            endDate: moment()
                                .add(100, 'y')
                                .toISOString(),
                        },
                        endDefault: true,
                        startDefault: true,
                    }}
                    csrfToken=""
                    pageProps={[]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
    describe('buildSalesConfirmationElements', () => {
        it('builds confirmation elements for the sales information', () => {
            const result = buildSalesConfirmationElements(
                [
                    {
                        name: 'A sales offer package',
                        description: 'my way of selling tickets',
                        purchaseLocations: ['at stop', 'website'],
                        paymentMethods: ['cash'],
                        ticketFormats: ['paper'],
                    },
                    {
                        name: 'Another sales offer package',
                        description: 'another way of selling tickets',
                        purchaseLocations: ['in station', 'phone'],
                        paymentMethods: ['mobileDevice'],
                        ticketFormats: ['phone'],
                    },
                ],
                {
                    productDates: {
                        startDate: moment().toISOString(),
                        endDate: moment()
                            .add(100, 'y')
                            .toISOString(),
                    },
                    endDefault: true,
                    startDefault: true,
                },
            );
            expect(result).toStrictEqual([
                { content: 'A sales offer package', href: 'selectSalesOfferPackages', name: 'Sales Offer Package' },
                {
                    content: 'Another sales offer package',
                    href: 'selectSalesOfferPackages',
                    name: 'Sales Offer Package',
                },
                { content: '25-09-2020', href: 'productDateInformation', name: 'Ticket Start Date (default)' },
                { content: '25-09-2120', href: 'productDateInformation', name: 'Ticket End Date (default)' },
            ]);
        });
    });
});
