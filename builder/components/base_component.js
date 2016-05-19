"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _jade = require("jade");

var _jade2 = _interopRequireDefault(_jade);

var _jsYaml = require("js-yaml");

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _glob = require("glob");

var _has = require("lodash/has");

var _has2 = _interopRequireDefault(_has);

var _get = require("lodash/get");

var _get2 = _interopRequireDefault(_get);

var _set = require("lodash/set");

var _set2 = _interopRequireDefault(_set);

var _isObject = require("lodash/isObject");

var _isObject2 = _interopRequireDefault(_isObject);

var _isNumber = require("lodash/isNumber");

var _isNumber2 = _interopRequireDefault(_isNumber);

var _isFunction = require("lodash/isFunction");

var _isFunction2 = _interopRequireDefault(_isFunction);

var _isUndefined = require("lodash/isUndefined");

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _isArray = require("lodash/isArray");

var _isArray2 = _interopRequireDefault(_isArray);

var _isString = require("lodash/isString");

var _isString2 = _interopRequireDefault(_isString);

var _cloneDeep = require("lodash/cloneDeep");

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _startsWith = require("lodash/startsWith");

var _startsWith2 = _interopRequireDefault(_startsWith);

var _forOwn = require("lodash/forOwn");

var _forOwn2 = _interopRequireDefault(_forOwn);

var _merge2 = require("lodash/merge");

var _merge3 = _interopRequireDefault(_merge2);

var _union = require("lodash/union");

var _union2 = _interopRequireDefault(_union);

var _pick = require("lodash/pick");

var _pick2 = _interopRequireDefault(_pick);

var _utils = require("../../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var local = {
  src: Symbol("src"),
  name: Symbol("name"),
  type: Symbol("type"),
  place: Symbol("place"),
  theme: Symbol("theme"),
  config: Symbol("config"),
  configPath: Symbol("configPath"),
  clientConfig: Symbol("clientConfig"),
  bodyInstance: Symbol("bodyInstance"),
  templateLocals: Symbol("templateLocals")
};

var Base = function () {
  function Base(config, overrideConfigObj, childInstance) {
    _classCallCheck(this, Base);

    this.saveConfig(config, overrideConfigObj);
    if (overrideConfigObj) this.updateConfig(overrideConfigObj);
    if (childInstance) this.setBodyInstance(childInstance);
    this.initTemplateLocals();
  }

  _createClass(Base, [{
    key: "isValidConfig",
    value: function isValidConfig(input) {
      var output = false;
      if ((0, _has2.default)(input, "name") && (0, _has2.default)(input, "src") && (0, _has2.default)(input, "config") && (0, _has2.default)(input, "configPath")) {
        output = true;
      }
      return output;
    }
  }, {
    key: "updateConfig",
    value: function updateConfig(sources) {
      if (sources) {
        var config = this.getConfig();
        config = this.merge(config, sources);
        this.setConfig(config);
        this.setTheme((0, _get2.default)(config, "route.theme"));
      }
      return this;
    }
  }, {
    key: "saveConfig",
    value: function saveConfig(configPath, overrideObj) {
      var data = this.readConfig(configPath, overrideObj);
      if (this.isValidConfig(data)) {
        this[local.src] = data.src;
        this[local.name] = data.name;
        this[local.type] = data.type;
        this[local.config] = data.config;
        this[local.configPath] = data.configPath;
      } else {
        throw new Error("@readConfig method should be return { name, src, config, configPath}");
      }
    }
  }, {
    key: "merge",
    value: function merge(input, sources) {
      var output = (0, _cloneDeep2.default)(input);
      return (0, _merge3.default)(output, sources);
    }
  }, {
    key: "getConfig",
    value: function getConfig(path) {
      var cfg = this[local.config];
      return path ? (0, _get2.default)(cfg, path) : cfg;
    }
  }, {
    key: "setConfig",
    value: function setConfig(obj) {
      this[local.config] = obj;
    }
  }, {
    key: "getName",
    value: function getName() {
      return this[local.name];
    }
  }, {
    key: "getType",
    value: function getType() {
      return this[local.type];
    }
  }, {
    key: "getConfigPath",
    value: function getConfigPath() {
      return this[local.configPath];
    }
  }, {
    key: "getSrc",
    value: function getSrc() {
      return this[local.src];
    }
  }, {
    key: "readTemplate",
    value: function readTemplate(theme) {
      return this.readTemplateForTheme(theme) || this.readTemplateForTheme("main") || null;
    }
  }, {
    key: "readTemplateForTheme",
    value: function readTemplateForTheme(theme) {
      var compilerFn = _jade2.default.compileFile;
      var compileOptions = {
        pretty: true,
        self: true
      };
      var filePath = this.getTemplatePathForTheme(theme);
      return filePath ? compilerFn(filePath, compileOptions) : null;
    }
  }, {
    key: "getTemplatePathForTheme",
    value: function getTemplatePathForTheme(theme) {
      var mask = (0, _utils.resolve)((0, _utils.join)(this.getSrc(), "**", theme + ".jade"));
      var files = (0, _glob.sync)(mask);
      return files.length ? files[0] : null;
    }
  }, {
    key: "hasTemplateForTheme",
    value: function hasTemplateForTheme(theme) {
      return this.getTemplatePathForTheme(theme) ? true : false;
    }
  }, {
    key: "getConfigPathForTheme",
    value: function getConfigPathForTheme(theme) {
      var mask = (0, _utils.resolve)((0, _utils.join)(this.getSrc(), "**", theme + ".yml"));
      var files = (0, _glob.sync)(mask);
      return files.length ? files[0] : null;
    }
  }, {
    key: "hasConfigForTheme",
    value: function hasConfigForTheme(theme) {
      return this.getConfigPathForTheme(theme) ? true : false;
    }
  }, {
    key: "getTemplate",
    value: function getTemplate(theme) {
      var html = "";
      if (!this.templateFn) {
        this.templateFn = this.readTemplate(theme);
      }
      if ((0, _isFunction2.default)(this.templateFn)) {
        html = this.templateFn(this.getTemplateLocals());
      }
      return html;
    }
  }, {
    key: "getTemplateLocals",
    value: function getTemplateLocals(path) {
      return (0, _isUndefined2.default)(path) ? this[local.templateLocals] : (0, _get2.default)(this[local.templateLocals], path);
    }
  }, {
    key: "setTemplateLocal",
    value: function setTemplateLocal(path, obj) {
      if (!this[local.templateLocals]) this[local.templateLocals] = {};
      (0, _set2.default)(this[local.templateLocals], path, obj);
    }
  }, {
    key: "renderString",
    value: function renderString(prod, dev) {
      return dev || "";
    }
  }, {
    key: "initTemplateLocals",
    value: function initTemplateLocals() {

      var Helpers = this.getConfig("builder.helpers");

      var config = this.getConfig();

      this[local.templateLocals] = new Helpers(config);

      this.setTemplateLocal("include", this.include.bind(this));
    }
  }, {
    key: "setBodyInstance",
    value: function setBodyInstance(childInstance) {
      this[local.bodyInstance] = {
        instance: childInstance,
        html: childInstance.getHTML()
      };
      if (childInstance._JSOptions) {
        this.addJSOptions(childInstance, childInstance._JSOptions);
      }
    }
  }, {
    key: "getBodyInstance",
    value: function getBodyInstance() {
      return this[local.bodyInstance];
    }
  }, {
    key: "getTheme",
    value: function getTheme() {
      return this[local.theme];
    }
  }, {
    key: "setTheme",
    value: function setTheme(value) {
      if ((0, _isString2.default)(value)) this[local.theme] = value;
    }
  }, {
    key: "addJSOptions",
    value: function addJSOptions(instance, name, options) {
      this._JSOptions = this._JSOptions || [];
      if (arguments.length == 2 && (0, _isArray2.default)(name)) {
        this._JSOptions = (0, _union2.default)(this._JSOptions, name);
      } else {
        var type = instance.getName();
        var component_type = instance.getType();
        var model = {};
        if ((0, _startsWith2.default)(type, "react")) {
          component_type = "react-" + component_type;
          model = (0, _pick2.default)(instance.getClientConfig(), "template_options", "strings", "images", "links");
        }
        this._JSOptions.push({ name: name, type: type, component_type: component_type, options: options, model: model });
      }
    }
  }, {
    key: "parseAttributes",
    value: function parseAttributes(obj) {
      var _this = this;

      var type = arguments.length <= 1 || arguments[1] === undefined ? "attr" : arguments[1];

      var output = "";
      if ((0, _isString2.default)(obj)) {
        output = obj;
      } else if ((0, _isObject2.default)(obj)) {
        (0, _forOwn2.default)(obj, function (value, key) {
          if ((0, _isString2.default)(value) || (0, _isNumber2.default)(value)) {
            if (type == "attr") {
              output += " " + key + "=\"" + value + "\"";
            } else if (type == "props") {
              output += key + ":" + value + ";";
            }
          } else if ((0, _isObject2.default)(value)) {
            output += _this.parseAttributes(value, "props");
          }
        });
      }
      return output;
    }
  }, {
    key: "setPlace",
    value: function setPlace(value) {
      this[local.place] = value;
    }
  }, {
    key: "getPlace",
    value: function getPlace() {
      return this[local.place];
    }
  }, {
    key: "includeBody",
    value: function includeBody() {
      var ins = this.getBodyInstance();
      return ins && ins.html ? ins.html : "$BODY$";
    }
  }, {
    key: "getString",
    value: function getString(name) {
      var config = this.getClientConfig();
      return (0, _get2.default)(config, "strings." + name);
    }
  }, {
    key: "getLink",
    value: function getLink(name) {
      var config = this.getClientConfig();
      return (0, _get2.default)(config, "links." + name);
    }
  }, {
    key: "getImageURL",
    value: function getImageURL(name) {
      var config = this.getClientConfig();
      return (0, _get2.default)(config, "images." + name);
    }
  }, {
    key: "getOption",
    value: function getOption(name) {
      var config = this.getClientConfig();
      return (0, _get2.default)(config, "template_options." + name);
    }
  }, {
    key: "getHTML",
    value: function getHTML(theme) {
      return this.getTemplate(theme || this.getTheme());
    }
  }, {
    key: "getClientConfig",
    value: function getClientConfig() {
      var config = this.getConfig();
      var cache = this[local.clientConfig];

      if (!cache) {
        cache = {
          template_options: this.getPropsFrom(config.template_options, "default"),
          script_options: this.getPropsFrom(config.script_options, "default"),
          strings: this.getPropsFrom(config.strings, "default"),
          images: this.getPropsFrom(config.images, "default"),
          links: this.getPropsFrom(config.links, "default")
        };
      }
      return cache;
    }
  }, {
    key: "getPropsFrom",
    value: function getPropsFrom(input, propertyPath) {
      var output = {};
      if ((0, _isObject2.default)(input)) {
        (0, _forOwn2.default)(input, function (value, key) {
          key = (0, _startsWith2.default)(key, "$") ? key.substr(1) : key;
          output[key] = (0, _isObject2.default)(value) && propertyPath ? (0, _get2.default)(value, propertyPath) : value;
        });
      }
      return output;
    }
  }, {
    key: "includeCSS",
    value: function includeCSS() {
      var out = "";
      var themes = this.getConfig("route.themes");

      themes.forEach(function (theme) {
        out += "<link rel=stylesheet href=/webpack/styles/" + theme + ".css />\n";
      });

      return out;
    }
  }, {
    key: "includeJSOptions",
    value: function includeJSOptions() {
      var data = JSON.stringify(this.serverConfigurations, null, 4);
      return "<script>window[\"serverConfigurations\"] = " + data + "</script>";
    }
  }, {
    key: "readConfig",
    value: function readConfig(url, overrideObj) {
      var out = null;
      var theme = (0, _get2.default)(overrideObj, "route.theme");
      if ((0, _isString2.default)(url)) {
        var configPath = (0, _utils.resolve)(url);
        var src = (0, _utils.dirname)(url);
        var type = (0, _utils.basename)((0, _utils.dirname)(src));
        var name = (0, _utils.basename)(src);

        if (theme) {
          var theme_mask = (0, _utils.resolve)((0, _utils.join)(src, "**", theme + ".yml"));
          var theme_files = (0, _glob.sync)(theme_mask);
          configPath = theme_files.length ? theme_files[0] : configPath;
        }

        var config = _jsYaml2.default.safeLoad(_fs2.default.readFileSync(configPath, "utf8")) || {};
        out = { name: name, src: src, config: config, configPath: configPath, type: type };
      }
      return out;
    }
  }, {
    key: "hasIndexJS",
    get: function get() {
      var filePath = (0, _utils.resolve)((0, _utils.join)(this.getSrc(), "index.js"));
      var jsxFilePath = (0, _utils.resolve)((0, _utils.join)(this.getSrc(), "index.jsx"));
      return _fs2.default.existsSync(filePath) || _fs2.default.existsSync(jsxFilePath);
    }
  }, {
    key: "serverConfigurations",
    get: function get() {
      var obj = this.getConfig("route.serverConfigurations");
      return (0, _merge3.default)(obj, { "components": this._JSOptions });
    }
  }]);

  return Base;
}();

exports.default = Base;