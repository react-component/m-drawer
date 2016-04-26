// use jsx to render html, do not modify simple.html

import 'rc-drawer/assets/index.less';
import './simple.less';
import Drawer from 'rc-drawer';
import React from 'react';
import ReactDOM from 'react-dom';

const App = React.createClass({
  getInitialState() {
    return {
      docked: false,
      open: false,
      transitions: true,
      touch: true,
      pullRight: false,
      touchHandleWidth: 20,
      dragToggleDistance: 30,
    };
  },
  onSetOpen(open) {
    console.log('onSetOpen', open);
    this.setState({ open });
  },
  onDock() {
    const docked = !this.state.docked;
    this.setState({
      docked,
    });
    if (!docked) {
      this.onSetOpen(false);
    }
  },
  render() {
    const sidebar = (<div>
      <h3>
        sidebar
        <button onClick={this.onDock}>
          {this.state.docked ? 'unpin' : 'pin'}
        </button>
      </h3>
      <p>this is content!</p>
    </div>);

    const sidebarProps = {
      docked: this.state.docked,
      open: this.state.open,
      touch: this.state.touch,
      pullRight: this.state.pullRight,
      touchHandleWidth: this.state.touchHandleWidth,
      dragToggleDistance: this.state.dragToggleDistance,
      transitions: this.state.transitions,
      onSetOpen: this.onSetOpen,
    };
    return (<div className="drawer-container">
      <Drawer sidebar={sidebar} {...sidebarProps}>
        <div>
          <p>React Sidebar is a sidebar component for React.</p>
          <button onClick={() => {this.setState({ open: !this.state.open });}}>switch-open</button>
        </div>
      </Drawer>
    </div>);
  },
});

ReactDOM.render(<App />, document.getElementById('__react-content'));
