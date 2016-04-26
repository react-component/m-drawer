import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

const CANCEL_DISTANCE_ON_SCROLL = 20;

export default class Drawer extends React.Component {
  static propTypes = {
    prefixCls: React.PropTypes.string,
    // main content to render
    children: React.PropTypes.node.isRequired,

    // styles
    // styles: React.PropTypes.shape({
    //   dragHandle: React.PropTypes.object,
    // }),
    sidebarStyle: React.PropTypes.object,
    contentStyle: React.PropTypes.object,
    overlayStyle: React.PropTypes.object,
    dragHandleStyle: React.PropTypes.object,

    // sidebar content to render
    sidebar: React.PropTypes.node.isRequired,

    // boolean if sidebar should be docked
    docked: React.PropTypes.bool,

    // boolean if sidebar should slide open
    open: React.PropTypes.bool,

    // boolean if transitions should be disabled
    transitions: React.PropTypes.bool,

    // boolean if touch gestures are enabled
    touch: React.PropTypes.bool,

    // max distance from the edge we can start touching
    touchHandleWidth: React.PropTypes.number,

    // Place the sidebar on the right
    pullRight: React.PropTypes.bool,

    // distance we have to drag the sidebar to toggle open state
    dragToggleDistance: React.PropTypes.number,

    // callback called when the overlay is clicked
    onSetOpen: React.PropTypes.func,
  }

  static defaultProps = {
    prefixCls: 'rc-drawer',
    sidebarStyle: {},
    contentStyle: {},
    overlayStyle: {},
    dragHandleStyle: {},
    docked: false,
    open: false,
    transitions: true,
    touch: true,
    touchHandleWidth: 20,
    pullRight: false,
    dragToggleDistance: 30,
    onSetOpen: () => {},
  }

  constructor(props) {
    super(props);

    this.state = {
      // the detected width of the sidebar in pixels
      sidebarWidth: 0,

      // keep track of touching params
      touchIdentifier: null,
      touchStartX: null,
      touchStartY: null,
      touchCurrentX: null,
      touchCurrentY: null,

      // if touch is supported by the browser
      dragSupported: typeof window === 'object' && 'ontouchstart' in window,
    };

    this.overlayClicked = this.overlayClicked.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onScroll = this.onScroll.bind(this);
  }

  componentDidMount() {
    this.saveSidebarWidth();
  }

  componentDidUpdate() {
    // filter out the updates when we're touching
    if (!this.isTouching()) {
      this.saveSidebarWidth();
    }
  }

  onTouchStart(ev) {
    // filter out if a user starts swiping with a second finger
    if (!this.isTouching()) {
      const touch = ev.targetTouches[0];
      this.setState({
        touchIdentifier: touch.identifier,
        touchStartX: touch.clientX,
        touchStartY: touch.clientY,
        touchCurrentX: touch.clientX,
        touchCurrentY: touch.clientY,
      });
    }
  }

  onTouchMove(ev) {
    if (this.isTouching()) {
      for (let ind = 0; ind < ev.targetTouches.length; ind++) {
        // we only care about the finger that we are tracking
        if (ev.targetTouches[ind].identifier === this.state.touchIdentifier) {
          this.setState({
            touchCurrentX: ev.targetTouches[ind].clientX,
            touchCurrentY: ev.targetTouches[ind].clientY,
          });
          break;
        }
      }
    }
  }

  onTouchEnd() {
    if (this.isTouching()) {
      // trigger a change to open if sidebar has been dragged beyond dragToggleDistance
      const touchWidth = this.touchSidebarWidth();

      if (this.props.open && touchWidth < this.state.sidebarWidth - this.props.dragToggleDistance ||
          !this.props.open && touchWidth > this.props.dragToggleDistance) {
        this.props.onSetOpen(!this.props.open);
      }

      this.setState({
        touchIdentifier: null,
        touchStartX: null,
        touchStartY: null,
        touchCurrentX: null,
        touchCurrentY: null,
      });
    }
  }

  // This logic helps us prevents the user from sliding the sidebar horizontally
  // while scrolling the sidebar vertically. When a scroll event comes in, we're
  // cancelling the ongoing gesture if it did not move horizontally much.
  onScroll() {
    if (this.isTouching() && this.inCancelDistanceOnScroll()) {
      this.setState({
        touchIdentifier: null,
        touchStartX: null,
        touchStartY: null,
        touchCurrentX: null,
        touchCurrentY: null,
      });
    }
  }

  // True if the on going gesture X distance is less than the cancel distance
  inCancelDistanceOnScroll() {
    let cancelDistanceOnScroll;

    if (this.props.pullRight) {
      cancelDistanceOnScroll = Math.abs(this.state.touchCurrentX - this.state.touchStartX) <
                                        CANCEL_DISTANCE_ON_SCROLL;
    } else {
      cancelDistanceOnScroll = Math.abs(this.state.touchStartX - this.state.touchCurrentX) <
                                        CANCEL_DISTANCE_ON_SCROLL;
    }
    return cancelDistanceOnScroll;
  }

  isTouching() {
    return this.state.touchIdentifier !== null;
  }

  overlayClicked() {
    if (this.props.open) {
      this.props.onSetOpen(false);
    }
  }

  saveSidebarWidth() {
    const width = ReactDOM.findDOMNode(this.refs.sidebar).offsetWidth;

    if (width !== this.state.sidebarWidth) {
      this.setState({ sidebarWidth: width });
    }
  }

  // calculate the sidebarWidth based on current touch info
  touchSidebarWidth() {
    // if the sidebar is open and start point of drag is inside the sidebar
    // we will only drag the distance they moved their finger
    // otherwise we will move the sidebar to be below the finger.
    if (this.props.pullRight) {
      if (this.props.open && window.innerWidth - this.state.touchStartX < this.state.sidebarWidth) {
        if (this.state.touchCurrentX > this.state.touchStartX) {
          return this.state.sidebarWidth + this.state.touchStartX - this.state.touchCurrentX;
        }
        return this.state.sidebarWidth;
      }
      return Math.min(window.innerWidth - this.state.touchCurrentX, this.state.sidebarWidth);
    }

    if (this.props.open && this.state.touchStartX < this.state.sidebarWidth) {
      if (this.state.touchCurrentX > this.state.touchStartX) {
        return this.state.sidebarWidth;
      }
      return this.state.sidebarWidth - this.state.touchStartX + this.state.touchCurrentX;
    }
    return Math.min(this.state.touchCurrentX, this.state.sidebarWidth);
  }

  render() {
    const props = this.props;
    const prefixCls = props.prefixCls;
    const rootProps = {};
    const sidebarStyle = { ...props.sidebarStyle };
    const contentStyle = { ...props.contentStyle };
    const overlayStyle = { ...props.overlayStyle };
    const useTouch = this.state.dragSupported && this.props.touch;
    const isTouching = this.isTouching();
    let dragHandle;

    rootProps.className = props.pullRight ?
      classNames(props.className, props.prefixCls, `${props.prefixCls}-right`) :
      classNames(props.className, props.prefixCls, `${props.prefixCls}-left`);

    if (isTouching) {
      const percentage = this.touchSidebarWidth() / this.state.sidebarWidth;

      // slide open to what we dragged
      if (this.props.pullRight) {
        sidebarStyle.transform = `translateX(${(1 - percentage) * 100}%)`;
        sidebarStyle.WebkitTransform = `translateX(${(1 - percentage) * 100}%)`;
      } else {
        sidebarStyle.transform = `translateX(-${(1 - percentage) * 100}%)`;
        sidebarStyle.WebkitTransform = `translateX(-${(1 - percentage) * 100}%)`;
      }

      // fade overlay to match distance of drag
      overlayStyle.opacity = percentage;
      overlayStyle.visibility = 'visible';
    } else if (this.props.docked) {
      // show sidebar
      if (this.state.sidebarWidth !== 0) {
        sidebarStyle.transform = `translateX(0%)`;
        sidebarStyle.WebkitTransform = `translateX(0%)`;
      }

      // make space on the left/right side of the content for the sidebar
      if (this.props.pullRight) {
        contentStyle.right = `${this.state.sidebarWidth}px`;
      } else {
        contentStyle.left = `${this.state.sidebarWidth}px`;
      }
    } else if (this.props.open) {
      // slide open sidebar
      sidebarStyle.transform = `translateX(0%)`;
      sidebarStyle.WebkitTransform = `translateX(0%)`;

      // show overlay
      overlayStyle.opacity = 1;
      overlayStyle.visibility = 'visible';
    }

    if (isTouching || !this.props.transitions) {
      sidebarStyle.transition = 'none';
      sidebarStyle.WebkitTransition = 'none';
      contentStyle.transition = 'none';
      overlayStyle.transition = 'none';
    }

    if (useTouch) {
      if (this.props.open) {
        rootProps.onTouchStart = this.onTouchStart;
        rootProps.onTouchMove = this.onTouchMove;
        rootProps.onTouchEnd = this.onTouchEnd;
        rootProps.onTouchCancel = this.onTouchEnd;
        rootProps.onScroll = this.onScroll;
      } else {
        const dragHandleStyle = { ...props.dragHandleStyle };
        dragHandleStyle.width = this.props.touchHandleWidth;

        if (this.props.pullRight) {
          dragHandleStyle.right = 0;
        } else {
          dragHandleStyle.left = 0;
        }

        dragHandle = (
          <div className={`${prefixCls}-draghandle`} style={dragHandleStyle}
            onTouchStart={this.onTouchStart} onTouchMove={this.onTouchMove}
            onTouchEnd={this.onTouchEnd} onTouchCancel={this.onTouchEnd}
            ref="dragHandle"
          />);
      }
    }

    return (
      <div {...rootProps}>
        <div className={`${prefixCls}-sidebar`} style={sidebarStyle}
          ref="sidebar"
        >
          {this.props.sidebar}
        </div>
        <div className={`${prefixCls}-overlay`} style={overlayStyle}
          onClick={this.overlayClicked}
          onTouchTap={this.overlayClicked}
          ref="overlay"
        />
        <div className={`${prefixCls}-content`} style={contentStyle}
          ref="content"
        >
          {dragHandle}
          {this.props.children}
        </div>
      </div>
    );
  }
}
