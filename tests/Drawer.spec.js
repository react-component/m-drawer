/* eslint-disable no-undef */
import React from 'react';
import { render, mount } from 'enzyme';
import { renderToJson } from 'enzyme-to-json';
import Drawer from '..';

describe('Drawer', () => {
  it('renders correctly', () => {
    const wrapper = render(
      <Drawer className="forTest" touch sidebar={<p>sidebar</p>}>
        <p>React Sidebar is a sidebar component for React.</p>
      </Drawer>
    );
    expect(renderToJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('.forTest').length === 1).toBe(true);
  });

  it('should close the sidebar', () => {
    const cb = jest.fn();
    const wrapper = mount(
      <Drawer touch sidebar={<p>sidebar</p>} onOpenChange={cb} open>
        <p>React Sidebar is a sidebar component for React.</p>
      </Drawer>
    );
    // console.log(wrapper.html())
    wrapper.find('.rmc-drawer-overlay').simulate('click');
    expect(cb).toBeCalledWith(false, { overlayClicked: true });
  });
});
