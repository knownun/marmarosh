"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _cloneDeep = require("lodash/cloneDeep");

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var local = {
  component: (0, _symbol2.default)("component")
};

var Interface = function () {
  function Interface(inst) {
    (0, _classCallCheck3.default)(this, Interface);

    this[local.component] = inst;
  }

  (0, _createClass3.default)(Interface, [{
    key: "name",
    get: function get() {
      return this[local.component].name;
    }
  }, {
    key: "type",
    get: function get() {
      return this[local.component].type;
    }
  }, {
    key: "theme",
    get: function get() {
      return this[local.component].theme;
    }
  }, {
    key: "dir",
    get: function get() {
      return this[local.component].src;
    }
  }, {
    key: "config",
    get: function get() {
      return (0, _cloneDeep2.default)(this[local.component].config);
    }
  }, {
    key: "widget",
    set: function set(value) {
      var name = value.name;
      var type = value.type;

      this[local.component].addWidgetToConfig(name, type);
    }
  }]);
  return Interface;
}();

exports.default = Interface;