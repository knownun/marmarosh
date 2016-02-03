"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require("path");

var _webpackBuilder = require("../builders/webpack/webpack-builder");

var _webpackBuilder2 = _interopRequireDefault(_webpackBuilder);

var _templatesBuilder = require("../builders/marmarosh/templates-builder");

var _templatesBuilder2 = _interopRequireDefault(_templatesBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var local = {
  config: Symbol("config"),
  builder: Symbol("builder")
};

var builders = new Map();

builders.set("webpack", _webpackBuilder2.default);
builders.set("marmarosh-templates", _templatesBuilder2.default);

var Builder = function () {
  function Builder(name, resources) {
    _classCallCheck(this, Builder);

    this[local.config] = resources;

    if (!builders.has(name)) {
      throw new Error("builder type \"" + name + "\" does not registered");
    }

    var _Builder = builders.get(name);

    this[local.builder] = new _Builder(resources);
  }

  _createClass(Builder, [{
    key: "getConfig",
    value: function getConfig() {
      return this[local.config];
    }
  }, {
    key: "getApplicationBuilder",
    value: function getApplicationBuilder() {
      return this[local.builder];
    }
  }, {
    key: "run",
    value: function run(cb) {
      this.getApplicationBuilder().run(cb);
    }
  }]);

  return Builder;
}();

exports.default = Builder;