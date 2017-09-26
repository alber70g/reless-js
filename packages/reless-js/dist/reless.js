(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.reless = factory());
}(this, (function () { 'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Reless = function () {
  function Reless(initializer) {
    var _this = this;

    _classCallCheck(this, Reless);

    initializer = initializer || {};
    this.appState = _extends({}, initializer.state);
    var reducers = _extends({}, initializer.reducers);
    var events = _extends({}, initializer.events);
    this.events = events;

    var devTools = window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__.connect() : undefined;
    devTools && devTools.init(this.appState);
    devTools && (reducers.setState = function (payload) {
      return JSON.parse(payload);
    });

    // Wrap all reducers so they can be called directly
    this.reducers = Object.keys(reducers).reduce(function (acc, name) {
      var reducer = reducers[name];
      // wrap the reducer in a function accepting the payload
      acc[name] = function (payload) {
        if (typeof payload === 'function') {
          payload = payload(_this.state);
        }
        // call the reducer with the payload
        var withState = reducer(payload);
        // define withReducers and fromWithReducers to be able to _merge lateron
        var withReducers = null;
        var fromWithReducers = null;
        if (typeof withState === 'function') {
          // the reducer returned another function (withStateFn),
          // call withStateFn with the state
          withReducers = withState(_this.appState);
          if (typeof withReducers === 'function') {
            // the withStateFn returned a function (withReducersFn)
            // call withReducersFn with the reducers
            fromWithReducers = withReducers(_this.reducers);
          }
        }
        // _merge the result of either function with the current state
        _this.appState = _this._merge(_this.appState, fromWithReducers || withReducers || withState);
        // send to redux dev tools
        name !== 'setState' && devTools && devTools.send({ type: name, payload: payload }, _this.appState);
        if (events.newState) events.newState(_this.state);
      };
      return acc;
    }, {});

    devTools && devTools.subscribe(function (message) {
      message.type === 'DISPATCH' && message.state && _this.reducers.setState(message.state);
    });
  }

  _createClass(Reless, [{
    key: '_merge',
    value: function _merge(a, b) {
      for (var i in b) {
        a[i] = b[i];
      }
      return a;
    }
  }, {
    key: 'state',
    get: function get() {
      return Object.freeze(_extends({}, this.appState));
    }
  }]);

  return Reless;
}();

return Reless;

})));
//# sourceMappingURL=reless.js.map
