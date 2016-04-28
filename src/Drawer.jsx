import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

function getOffset(ele) {
  let el = ele;
  let _x = 0;
  let _y = 0;
  while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
    _x += el.offsetLeft - el.scrollLeft;
    _y += el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  }
  return { top: _y, left: _x };
}

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

    // where to place the sidebar
    position: React.PropTypes.oneOf(['left', 'right', 'top', 'bottom']),

    // distance we have to drag the sidebar to toggle open state
    dragToggleDistance: React.PropTypes.number,

    // callback called when the overlay is clicked
    onOpenChange: React.PropTypes.func,
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
    position: 'left',
    dragToggleDistance: 30,
    onOpenChange: () => {},
  }

  constructor(props) {
    super(props);

    this.state = {
      // the detected width of the sidebar in pixels
      sidebarWidth: 0,
      sidebarHeight: 0,
      sidebarTop: 0,
      dragHandleTop: 0,

      // keep track of touching params
      touchIdentifier: null,
      touchStartX: null,
      touchStartY: null,
      touchCurrentX: null,
      touchCurrentY: null,

      // if touch is supported by the browser
      touchSupported: typeof window === 'object' && 'ontouchstart' in window,
    };
  }

  componentDidMount() {
    this.saveSidebarSize();
  }

  componentDidUpdate() {
    // filter out the updates when we're touching
    if (!this.isTouching()) {
      this.saveSidebarSize();
    }
  }

  onOverlayClicked = () => {
    if (this.props.open) {
      this.props.onOpenChange(false);
    }
  }

  onTouchStart = (ev) => {
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

  onTouchMove = (ev) => {
    ev.preventDefault();
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

  onTouchEnd = () => {
    if (this.isTouching()) {
      // trigger a change to open if sidebar has been dragged beyond dragToggleDistance
      const touchWidth = this.touchSidebarWidth();

      if (this.props.open && touchWidth < this.state.sidebarWidth - this.props.dragToggleDistance ||
          !this.props.open && touchWidth > this.props.dragToggleDistance) {
        this.props.onOpenChange(!this.props.open);
      }

      const touchHeight = this.touchSidebarHeight();

      if (this.props.open &&
          touchHeight < this.state.sidebarHeight - this.props.dragToggleDistance ||
          !this.props.open && touchHeight > this.props.dragToggleDistance) {
        this.props.onOpenChange(!this.props.open);
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
  onScroll = () => {
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
  inCancelDistanceOnScroll = () => {
    let cancelDistanceOnScroll;
    switch (this.props.position) {
      case 'right':
        cancelDistanceOnScroll = Math.abs(this.state.touchCurrentX - this.state.touchStartX) <
                                        CANCEL_DISTANCE_ON_SCROLL;
        break;
      case 'bottom':
        cancelDistanceOnScroll = Math.abs(this.state.touchCurrentY - this.state.touchStartY) <
                                      CANCEL_DISTANCE_ON_SCROLL;
        break;
      case 'top':
        cancelDistanceOnScroll = Math.abs(this.state.touchStartY - this.state.touchCurrentY) <
                                        CANCEL_DISTANCE_ON_SCROLL;
        break;
      case 'left':
      default:
        cancelDistanceOnScroll = Math.abs(this.state.touchStartX - this.state.touchCurrentX) <
                                        CANCEL_DISTANCE_ON_SCROLL;
    }
    return cancelDistanceOnScroll;
  }

  isTouching = () => {
    return this.state.touchIdentifier !== null;
  }

  saveSidebarSize = () => {
    const sidebar = ReactDOM.findDOMNode(this.refs.sidebar);
    const width = sidebar.offsetWidth;
    const height = sidebar.offsetHeight;
    const sidebarTop = getOffset(ReactDOM.findDOMNode(this.refs.sidebar)).top;
    const dragHandleTop = getOffset(ReactDOM.findDOMNode(this.refs.dragHandle)).top;

    if (width !== this.state.sidebarWidth) {
      this.setState({ sidebarWidth: width });
    }
    if (height !== this.state.sidebarHeight) {
      this.setState({ sidebarHeight: height });
    }
    if (sidebarTop !== this.state.sidebarTop) {
      this.setState({ sidebarTop });
    }
    if (dragHandleTop !== this.state.dragHandleTop) {
      this.setState({ dragHandleTop });
    }
  }

  // calculate the sidebarWidth based on current touch info
  touchSidebarWidth = () => {
    // if the sidebar is open and start point of drag is inside the sidebar
    // we will only drag the distance they moved their finger
    // otherwise we will move the sidebar to be below the finger.
    if (this.props.position === 'right') {
      if (this.props.open && window.innerWidth - this.state.touchStartX < this.state.sidebarWidth) {
        if (this.state.touchCurrentX > this.state.touchStartX) {
          return this.state.sidebarWidth + this.state.touchStartX - this.state.touchCurrentX;
        }
        return this.state.sidebarWidth;
      }
      return Math.min(window.innerWidth - this.state.touchCurrentX, this.state.sidebarWidth);
    }

    if (this.props.position === 'left') {
      if (this.props.open && this.state.touchStartX < this.state.sidebarWidth) {
        if (this.state.touchCurrentX > this.state.touchStartX) {
          return this.state.sidebarWidth;
        }
        return this.state.sidebarWidth - this.state.touchStartX + this.state.touchCurrentX;
      }
      return Math.min(this.state.touchCurrentX, this.state.sidebarWidth);
    }
  }
  // calculate the sidebarHeight based on current touch info
  touchSidebarHeight = () => {
    // if the sidebar is open and start point of drag is inside the sidebar
    // we will only drag the distance they moved their finger
    // otherwise we will move the sidebar to be below the finger.
    if (this.props.position === 'bottom') {
      if (this.props.open &&
        window.innerHeight - this.state.touchStartY < this.state.sidebarHeight) {
        if (this.state.touchCurrentY > this.state.touchStartY) {
          return this.state.sidebarHeight + this.state.touchStartY - this.state.touchCurrentY;
        }
        return this.state.sidebarHeight;
      }
      return Math.min(window.innerHeight - this.state.touchCurrentY, this.state.sidebarHeight);
    }

    if (this.props.position === 'top') {
      const touchStartOffsetY = this.state.touchStartY - this.state.sidebarTop;
      if (this.props.open && touchStartOffsetY < this.state.sidebarHeight) {
        if (this.state.touchCurrentY > this.state.touchStartY) {
          return this.state.sidebarHeight;
        }
        return this.state.sidebarHeight - this.state.touchStartY + this.state.touchCurrentY;
      }
      return Math.min(this.state.touchCurrentY - this.state.dragHandleTop,
        this.state.sidebarHeight);
    }
  }

  renderStyle = ({ sidebarStyle, isTouching, overlayStyle, contentStyle }) => {
    if (this.props.position === 'right' || this.props.position === 'left') {
      sidebarStyle.transform = `translateX(0%)`;
      sidebarStyle.WebkitTransform = `translateX(0%)`;
      if (isTouching) {
        const percentage = this.touchSidebarWidth() / this.state.sidebarWidth;
        // slide open to what we dragged
        if (this.props.position === 'right') {
          sidebarStyle.transform = `translateX(${(1 - percentage) * 100}%)`;
          sidebarStyle.WebkitTransform = `translateX(${(1 - percentage) * 100}%)`;
        }
        if (this.props.position === 'left') {
          sidebarStyle.transform = `translateX(-${(1 - percentage) * 100}%)`;
          sidebarStyle.WebkitTransform = `translateX(-${(1 - percentage) * 100}%)`;
        }
        // fade overlay to match distance of drag
        overlayStyle.opacity = percentage;
        overlayStyle.visibility = 'visible';
      }
      if (contentStyle) {
        contentStyle[this.props.position] = `${this.state.sidebarWidth}px`;
      }
    }
    if (this.props.position === 'top' || this.props.position === 'bottom') {
      sidebarStyle.transform = `translateY(0%)`;
      sidebarStyle.WebkitTransform = `translateY(0%)`;
      if (isTouching) {
        const percentage = this.touchSidebarHeight() / this.state.sidebarHeight;
        // slide open to what we dragged
        if (this.props.position === 'bottom') {
          sidebarStyle.transform = `translateY(${(1 - percentage) * 100}%)`;
          sidebarStyle.WebkitTransform = `translateY(${(1 - percentage) * 100}%)`;
        }
        if (this.props.position === 'top') {
          sidebarStyle.transform = `translateY(-${(1 - percentage) * 100}%)`;
          sidebarStyle.WebkitTransform = `translateY(-${(1 - percentage) * 100}%)`;
        }
        // fade overlay to match distance of drag
        overlayStyle.opacity = percentage;
        overlayStyle.visibility = 'visible';
      }
      if (contentStyle) {
        contentStyle[this.props.position] = `${this.state.sidebarHeight}px`;
      }
    }
  }

  render() {
    const props = this.props;
    const prefixCls = props.prefixCls;
    const rootProps = {};
    const sidebarStyle = { ...props.sidebarStyle };
    const contentStyle = { ...props.contentStyle };
    const overlayStyle = { ...props.overlayStyle };
    const isTouching = this.isTouching();
    let dragHandle = null;

    rootProps.className = classNames(props.className, props.prefixCls,
      `${props.prefixCls}-${props.position}`);

    if (isTouching) {
      this.renderStyle({ sidebarStyle, isTouching: true, overlayStyle });
    } else if (this.props.docked) {
      // show sidebar
      if (this.state.sidebarWidth !== 0) {
        this.renderStyle({ sidebarStyle, contentStyle });
      }
    } else if (this.props.open) {
      // slide open sidebar
      this.renderStyle({ sidebarStyle });
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

    if (this.state.touchSupported && this.props.touch) {
      if (this.props.open) {
        rootProps.onTouchStart = this.onTouchStart;
        rootProps.onTouchMove = this.onTouchMove;
        rootProps.onTouchEnd = this.onTouchEnd;
        rootProps.onTouchCancel = this.onTouchEnd;
        rootProps.onScroll = this.onScroll;
      } else {
        const dragHandleStyle = { ...props.dragHandleStyle };

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
          onClick={this.onOverlayClicked}
          onTouchTap={this.onOverlayClicked}
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
