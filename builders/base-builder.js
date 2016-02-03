'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var local = {
  events: Symbol('events'),
  available: ['build.start', 'build.end', 'build.error']
};

var BaseBuilder = function () {
  function BaseBuilder(builderConfig) {
    _classCallCheck(this, BaseBuilder);

    this.config = builderConfig;
    this[local.events] = new _events2.default.EventEmitter();
    this[local.events].setMaxListeners(0);
  }

  _createClass(BaseBuilder, [{
    key: 'run',
    value: function run(cb) {
      throw new Error('@run method should be implemented');
    }
  }, {
    key: 'getConfig',
    value: function getConfig() {
      throw new Error('@getConfig method should be implemented');
    }
  }, {
    key: 'on',
    value: function on(event, fn) {
      this[local.events].on(event, fn);
      return this;
    }
  }, {
    key: 'once',
    value: function once(event, fn) {
      this[local.events].once(event, fn);
      return this;
    }
  }, {
    key: 'remove',
    value: function remove(event) {
      this[local.events].removeAllListeners(event);
      return this;
    }
  }, {
    key: 'emit',
    value: function emit(event, params) {
      this[local.events].emit(event, params);
      return this;
    }
  }, {
    key: 'env',
    get: function get() {
      return process.env.NODE_ENV;
    }
  }, {
    key: 'isProduction',
    get: function get() {
      return process.env.NODE_ENV == "production";
    }
  }]);

  return BaseBuilder;
}();

exports.default = BaseBuilder;