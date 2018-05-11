// use jsx to render html, do not modify simple.html

import 'rmc-drawer/assets/index.less';
import './simple.less';
import Drawer from 'rmc-drawer';
import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      docked: false,
      open: false,
      transitions: true,
      touch: true,
      enableDragHandle: true,
      position: 'left',
      dragToggleDistance: 30,
    };
  }
  onOpenChange = (open) => {
    this.setState({ open });
  }
  onDock = () => {
    const docked = !this.state.docked;
    this.setState({
      docked,
    });
    if (!docked) {
      this.onOpenChange(false);
    }
  }
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

    const drawerProps = {
      docked: this.state.docked,
      open: this.state.open,
      touch: this.state.touch,
      enableDragHandle: this.state.enableDragHandle,
      position: this.state.position,
      dragToggleDistance: this.state.dragToggleDistance,
      transitions: this.state.transitions,
      onOpenChange: this.onOpenChange,
    };
    return (<div className="drawer-container">
      <Drawer sidebar={sidebar} {...drawerProps} style={{ overflow: 'auto' }}>
        <div className="main">
          <p>React component</p>
          <button onClick={() => { this.setState({ open: !this.state.open }); }}>
            switch-open
          </button>
          <p>
            {['left', 'right', 'top', 'bottom'].map((i, index) => (<span
              key={index} style={{ marginRight: 10 }}
            >
              <input type="radio" value={i} id={`pos-${index}`}
                checked={this.state.position === i}
                onChange={(e) => { this.setState({ position: e.target.value }); }}
              /> <label htmlFor={`pos-${index}`}>{i}</label>
            </span>))}
          </p>
          <p style={{ float: 'right' }}>right content</p>
          <p style={{ position: 'absolute', bottom: 10 }}>bottom content</p>
        </div>
      </Drawer>
    </div>);
  }
}

ReactDOM.render(<App />, document.getElementById('__react-content'));
