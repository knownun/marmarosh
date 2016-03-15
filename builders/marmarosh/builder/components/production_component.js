"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _jsYaml = require("js-yaml");

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _helpers = require("../../../../utils/helpers");

var _base_component = require("./base_component");

var _base_component2 = _interopRequireDefault(_base_component);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ProdComponent = function (_Base) {
  _inherits(ProdComponent, _Base);

  function ProdComponent(config, overrideConfigObj) {
    _classCallCheck(this, ProdComponent);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ProdComponent).call(this, config, overrideConfigObj));
  }

  _createClass(ProdComponent, [{
    key: "include",
    value: function include(componentPath, widgetName) {
      var typeName = (0, _helpers.basename)(componentPath);
      var name = widgetName || typeName;
      this.widgets = this.widgets || {};
      this.widgets[name] = {
        "default": typeName
      };
      var template = this.getConfig("builder.serverReplace.include");
      var placeholder = _lodash2.default.get(this.getServerConfig(), "widgets." + name);
      return (placeholder || (_lodash2.default.isString(template) ? template.replace("${name}", name) : "@Widget(\"" + name + "\")")) + "\n";
    }
  }, {
    key: "includeBody",
    value: function includeBody() {
      var template = this.getConfig("builder.serverReplace.includeBody");
      return (_lodash2.default.isString(template) ? template : "@Body()") + "\n";
    }
  }, {
    key: "getString",
    value: function getString(name) {
      var placeholder = _lodash2.default.get(this.getServerConfig(), "strings." + name);
      var template = this.getConfig("builder.serverReplace.getString");
      return placeholder || _lodash2.default.isString(template) ? template.replace("${name}", name) : "@ViewBag.strings." + name;
    }
  }, {
    key: "getLink",
    value: function getLink(name) {
      var placeholder = _lodash2.default.get(this.getServerConfig(), "links." + name);
      var template = this.getConfig("builder.serverReplace.getLink");
      return placeholder || _lodash2.default.isString(template) ? template.replace("${name}", name) : "@ViewBag.urls." + name;
    }
  }, {
    key: "getImageURL",
    value: function getImageURL(name) {
      var placeholder = _lodash2.default.get(this.getServerConfig(), "images." + name);
      var template = this.getConfig("builder.serverReplace.getImageURL");
      return placeholder || _lodash2.default.isString(template) ? template.replace("${name}", name) : "@ViewBag.images." + name;
    }
  }, {
    key: "getOption",
    value: function getOption(name) {
      var placeholder = _lodash2.default.get(this.getServerConfig(), "template_options." + name);
      var template = this.getConfig("builder.serverReplace.getOption");
      return placeholder || _lodash2.default.isString(template) ? template.replace("${name}", name) : "@ViewBag.template." + name;
    }
  }, {
    key: "includeMeta",
    value: function includeMeta() {
      var template = this.getConfig("builder.serverReplace.includeMeta");
      return (_lodash2.default.isString(template) ? template : "@Meta()") + "\n";
    }
  }, {
    key: "getHtmlClass",
    value: function getHtmlClass() {
      var template = this.getConfig("builder.serverReplace.getHtmlClass");
      return _lodash2.default.isString(template) ? template : "@getHtmlClass()";
    }
  }, {
    key: "includeCSS",
    value: function includeCSS() {
      var template = this.getConfig("builder.serverReplace.includeCSS");
      return (_lodash2.default.isString(template) ? template : "@CssReferences()") + "\n";
    }
  }, {
    key: "includeJS",
    value: function includeJS() {
      var template = this.getConfig("builder.serverReplace.includeJS");
      return (_lodash2.default.isString(template) ? template : "@ScriptsReferences()") + "\n";
    }
  }, {
    key: "includeJSOptions",
    value: function includeJSOptions() {
      var template = this.getConfig("builder.serverReplace.includeJSOptions");
      return (_lodash2.default.isString(template) ? template : "@ServerConfigurations()") + "\n";
    }
  }, {
    key: "IF",
    value: function IF(left) {
      var operand = arguments.length <= 1 || arguments[1] === undefined ? "!=" : arguments[1];
      var right = arguments.length <= 2 || arguments[2] === undefined ? "null" : arguments[2];

      var leftStr = parseSelector.bind(this)(left);
      var rightStr = parseSelector.bind(this)(right);
      return "\n" + ("@if(" + leftStr + " " + operand + " " + rightStr + ")") + "{\n";
    }
  }, {
    key: "IF_NOT",
    value: function IF_NOT(left) {
      var operand = arguments.length <= 1 || arguments[1] === undefined ? "!=" : arguments[1];
      var right = arguments.length <= 2 || arguments[2] === undefined ? "null" : arguments[2];

      var leftStr = parseSelector.bind(this)(left);
      var rightStr = parseSelector.bind(this)(right);
      return "\n" + ("@if(!(" + leftStr + " " + operand + " " + rightStr + "))") + "{\n";
    }
  }, {
    key: "ENDIF",
    value: function ENDIF() {
      return "\n}\n";
    }
  }, {
    key: "includeServerHelper",
    value: function includeServerHelper(helper) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return helper.replace(/\$\d/gm, function (str) {
        return args[str.substr(1) - 1];
      });
    }
  }, {
    key: "renderString",
    value: function renderString(prod, dev) {
      return prod || "";
    }
  }, {
    key: "initTemplateLocals",
    value: function initTemplateLocals() {
      _get(Object.getPrototypeOf(ProdComponent.prototype), "initTemplateLocals", this).call(this);
      this.setTemplateLocal("dev", false);
    }
  }, {
    key: "getServerConfig",
    value: function getServerConfig() {
      var config = this.getConfig();
      return {
        template_options: this.getPropsFrom(config.template_options, "placeholder"),
        layout_options: this.getPropsFrom(config.layout_options, "placeholder"),
        script_options: this.getPropsFrom(config.script_options, "placeholder"),
        widgets: this.getPropsFrom(config.widgets, "placeholder"),
        strings: this.getPropsFrom(config.strings, "placeholder"),
        images: this.getPropsFrom(config.images, "placeholder"),
        links: this.getPropsFrom(config.links, "placeholder")
      };
    }
  }, {
    key: "getPropsFrom",
    value: function getPropsFrom(input, propertyPath) {
      var output = {};
      if (_lodash2.default.isObject(input)) {
        _lodash2.default.forOwn(input, function (value, key) {
          if (!_lodash2.default.startsWith(key, "$")) {
            output[key] = _lodash2.default.isObject(value) && propertyPath ? _lodash2.default.get(value, propertyPath) : value;
          }
        });
      }
      return output;
    }
  }, {
    key: "readTemplate",
    value: function readTemplate(theme) {
      return this.readTemplateForTheme(theme, this.getName()) || null;
    }
  }, {
    key: "getTemplate",
    value: function getTemplate(theme) {
      var html = null;
      this.templateFn = this.readTemplate(theme);
      if (_lodash2.default.isFunction(this.templateFn)) {
        html = this.templateFn(this.getTemplateLocals());
      }
      return html;
    }
  }, {
    key: "includeSet",
    value: function includeSet(componentPath, models) {
      var name = (0, _helpers.basename)(componentPath);
      this.widgets = this.widgets || {};
      _lodash2.default.set(this.widgets, name, { "default": name });
      return "\n" + ("@RepeatWidget(\"" + name + "\", " + models + ")") + "\n";
    }
  }, {
    key: "itemIndex",
    value: function itemIndex() {
      return "@ViewBag.index";
    }
  }]);

  return ProdComponent;
}(_base_component2.default);

exports.default = ProdComponent;


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