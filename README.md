# rc-drawer
---

React Drawer Component


[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![gemnasium deps][gemnasium-image]][gemnasium-url]
[![npm download][download-image]][download-url]

[npm-image]: http://img.shields.io/npm/v/rc-drawer.svg?style=flat-square
[npm-url]: http://npmjs.org/package/rc-drawer
[travis-image]: https://img.shields.io/travis/react-component/drawer.svg?style=flat-square
[travis-url]: https://travis-ci.org/react-component/drawer
[coveralls-image]: https://img.shields.io/coveralls/react-component/drawer.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/react-component/drawer?branch=master
[gemnasium-image]: http://img.shields.io/gemnasium/react-component/drawer.svg?style=flat-square
[gemnasium-url]: https://gemnasium.com/react-component/drawer
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/rc-drawer.svg?style=flat-square
[download-url]: https://npmjs.org/package/rc-drawer


## Screenshots

<img src="https://os.alipayobjects.com/rmsportal/gqhazYYGIaUmunx.png" width="288"/>


## Development

```
npm install
npm start
```

## Example

http://localhost:8099/examples/


online example: http://react-component.github.io/drawer/


## install


[![rc-drawer](https://nodei.co/npm/rc-drawer.png)](https://npmjs.org/package/rc-drawer)


## Usage

```js
var Drawer = require('rc-drawer');
var React = require('react');
React.render(<Drawer />, container);
```

## API

### props

| Property name | Type | Default | Description |
|---------------|------|---------|-------------|
| className | String | '' | additional css class of root dom node |
| prefixCls | String | 'rci-sidebar' | prefix class |
| children | Anything React can render | n/a | The main content |
| sidebarStyle | object | {} | Inline styles. |
| contentStyle | object | {} | Inline styles. |
| overlayStyle | object | {} | Inline styles. |
| dragHandleStyle | object | {} | Inline styles. |
| sidebar | Anything React can render | n/a | The sidebar content |
| onSetOpen | function | n/a | Callback called when the sidebar wants to change the open prop. Happens after sliding the sidebar and when the overlay is clicked when the sidebar is open. |
| open | boolean | false | If the sidebar should be open |
| position | string | left, enum{'left', 'right', 'top', 'bottom'} | where to place the sidebar |
| docked | boolean | false | If the sidebar should be docked in document |
| transitions | boolean | true | If transitions should be enabled |
| touch | boolean | true | If touch gestures should be enabled |
| touchHandleWidth | number | 20 | Width in pixels you can start dragging from the edge when the sidebar is closed. |
| dragToggleDistance | number | 30 | Distance the sidebar has to be dragged before it will open/close after it is released. |

> change from [https://github.com/balloob/react-sidebar](https://github.com/balloob/react-sidebar)


## Test Case

```
npm test
npm run chrome-test
```

## Coverage

```
npm run coverage
```

open coverage/ dir

## License

rc-drawer is released under the MIT license.
