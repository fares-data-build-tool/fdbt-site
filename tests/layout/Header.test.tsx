import * as React from 'react';
import { shallow } from 'enzyme';
import Header from '../../src/layout/Header';

describe('Header', () => {
    it('should render correctly', () => {
        const tree = shallow(<Header isAuthed />);
        expect(tree).toMatchSnapshot();
    });

    it('expect title-link to be root', () => {
        const tree = shallow(<Header isAuthed />);
        expect(tree.find('#title-link').prop('href')).toEqual('/');
    });
});
