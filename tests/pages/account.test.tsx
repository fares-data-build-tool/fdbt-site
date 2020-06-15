import * as React from 'react';
import { shallow } from 'enzyme';
import AccountDetails, { getServerSideProps } from '../../src/pages/account';
import { getMockContext } from '../testData/mockData';

describe('pages', () => {
    describe('account', () => {
        it('should render correctly', () => {
            const tree = shallow(
                <AccountDetails emailAddress="joseppo.bloggo@somefakebuscompany.com" nocCode="FaBusCo" />,
            );
            expect(tree).toMatchSnapshot();
        });
    });

    describe('getServerSideProps', () => {
        it('throws an error if there is no ID_TOKEN cookie', () => {
            const ctx = getMockContext({ isLoggedin: false });

            expect(() => getServerSideProps(ctx)).toThrow('Necessary cookies not found to show account details');
        });
    });
});
