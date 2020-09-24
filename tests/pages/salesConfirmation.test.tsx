import * as React from 'react';
import { shallow } from 'enzyme';
import SalesConfirmation from '../../src/pages/salesConfirmation';

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
                    ticketDating={{}}
                    csrfToken=""
                    pageProps={[]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
});
