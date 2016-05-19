"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _isString = require("lodash/isString");

var _isString2 = _interopRequireDefault(_isString);

var _get = require("lodash/get");

var _get2 = _interopRequireDefault(_get);

var _utils = require("../../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var local = {
  builderConfig: Symbol("builderConfig"),
  serverConfig: Symbol("serverConfig")
};

exports.default = function (builderConfig) {
  return function () {
    function Helpers(config) {
      _classCallCheck(this, Helpers);

      this[local.builderConfig] = builderConfig;
      this[local.serverConfig] = config;
    }

    _createClass(Helpers, [{
      key: "getServerConfig",
      value: function getServerConfig() {
        return this[local.builderConfig];
      }
    }, {
      key: "getConfig",
      value: function getConfig(path) {
        var cfg = this[local.builderConfig];
        return path ? (0, _get2.default)(cfg, path) : cfg;
      }
    }, {
      key: "includeBody",
      value: function includeBody() {
        var template = this.getConfig("builder.serverReplace.includeBody");
        return ((0, _isString2.default)(template) ? template : "@Body()") + "\n";
      }
    }, {
      key: "getString",
      value: function getString(name) {
        var placeholder = (0, _get2.default)(this.getServerConfig(), "strings." + name);
        var template = this.getConfig("builder.serverReplace.getString");
        return placeholder || (0, _isString2.default)(template) ? template.replace("${name}", name) : "@ViewBag.strings." + name;
      }
    }, {
      key: "getLink",
      value: function getLink(name) {
        var placeholder = (0, _get2.default)(this.getServerConfig(), "links." + name);
        var template = this.getConfig("builder.serverReplace.getLink");
        return placeholder || (0, _isString2.default)(template) ? template.replace("${name}", name) : "@ViewBag.urls." + name;
      }
    }, {
      key: "getImageURL",
      value: function getImageURL(name) {
        var placeholder = (0, _get2.default)(this.getServerConfig(), "images." + name);
        var template = this.getConfig("builder.serverReplace.getImageURL");
        return placeholder || (0, _isString2.default)(template) ? template.replace("${name}", name) : "@ViewBag.images." + name;
      }
    }, {
      key: "getOption",
      value: function getOption(name) {
        var placeholder = (0, _get2.default)(this.getServerConfig(), "template_options." + name);
        var template = this.getConfig("builder.serverReplace.getOption");
        return placeholder || (0, _isString2.default)(template) ? template.replace("${name}", name) : "@ViewBag.template." + name;
      }
    }, {
      key: "includeMeta",
      value: function includeMeta() {
        var template = this.getConfig("builder.serverReplace.includeMeta");
        return ((0, _isString2.default)(template) ? template : "@Meta()") + "\n";
      }
    }, {
      key: "getHtmlClass",
      value: function getHtmlClass() {
        var template = this.getConfig("builder.serverReplace.getHtmlClass");
        return (0, _isString2.default)(template) ? template : "@getHtmlClass()";
      }
    }, {
      key: "includeCSS",
      value: function includeCSS() {
        var template = this.getConfig("builder.serverReplace.includeCSS");
        return ((0, _isString2.default)(template) ? template : "@CssReferences()") + "\n";
      }
    }, {
      key: "includeJS",
      value: function includeJS() {
        var template = this.getConfig("builder.serverReplace.includeJS");
        return ((0, _isString2.default)(template) ? template : "@ScriptsReferences()") + "\n";
      }
    }, {
      key: "includeJSOptions",
      value: function includeJSOptions() {
        var template = this.getConfig("builder.serverReplace.includeJSOptions");
        return ((0, _isString2.default)(template) ? template : "@ServerConfigurations()") + "\n";
      }
    }, {
      key: "if",
      value: function _if(left) {
        var operand = arguments.length <= 1 || arguments[1] === undefined ? "!=" : arguments[1];
        var right = arguments.length <= 2 || arguments[2] === undefined ? "null" : arguments[2];

        var leftStr = parseSelector.bind(this)(left);
        var rightStr = parseSelector.bind(this)(right);
        return "\n" + ("@if(" + leftStr + " " + operand + " " + rightStr + ")") + "{\n";
      }
    }, {
      key: "ifnot",
      value: function ifnot(left) {
        var operand = arguments.length <= 1 || arguments[1] === undefined ? "!=" : arguments[1];
        var right = arguments.length <= 2 || arguments[2] === undefined ? "null" : arguments[2];

        var leftStr = parseSelector.bind(this)(left);
        var rightStr = parseSelector.bind(this)(right);
        return "\n" + ("@if(!(" + leftStr + " " + operand + " " + rightStr + "))") + "{\n";
      }
    }, {
      key: "endif",
      value: function endif() {
        return "\n}\n";
      }
    }, {
      key: "includeSet",
      value: function includeSet(componentPath, models) {
        var name = (0, _utils.basename)(componentPath);
        this.widgets = this.widgets || {};
        (0, _get2.default)(this.widgets, name, { "default": name });
        return "\n" + ("@RepeatWidget(\"" + name + "\", " + models + ")") + "\n";
      }
    }, {
      key: "itemIndex",
      value: function itemIndex() {
        return "@ViewBag.index";
      }
    }, {
      key: "includeServerHelper",
      value: function includeServerHelper(helper) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        return helper.replace(/\$\d/gm, function (str) {
          return args[str.substr(1) - 1] || "null";
        });
      }
    }, {
      key: "helpersList",
      get: function get() {
        return this.registered;
      }
    }]);

    return Helpers;
  }();
};

function parseSelector(selector) {
  var out = selector || "null";
  if (selector && selector.split && selector.split(".").length == 2) {
    switch (selector.split(".")[0]) {
      case "strings":
        out = this.getString(selector.split(".")[1]);
        break;
      case "links":
        out = this.getLink(selector.split(".")[1]);
        break;
      case "images":
        out = this.getImageURL(selector.split(".")[1]);
        break;
      case "layout_options":
      case "template_options":
        out = this.getOption(selector.split(".")[1]);
        break;
    }
  }
  return out;
}