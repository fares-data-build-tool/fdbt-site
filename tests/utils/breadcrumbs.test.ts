import { NextPageContext } from 'next';
import breadcrumb from '../../src/utils/breadcrumbs';
import { getMockContext } from '../testData/mockData';

describe('breadcrumbs', () => {
    let ctx: NextPageContext;

    beforeEach(() => {
        ctx = getMockContext({
            url: '/fareType',
        });
    });

    it('', () => {
        const result = breadcrumb(ctx).generate();

        expect(result).toBe('');
    });
});
