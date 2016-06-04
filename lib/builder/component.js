"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _jade = require("jade");

var _jade2 = _interopRequireDefault(_jade);

var _jsYaml = require("js-yaml");

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _glob = require("glob");

var _glob2 = _interopRequireDefault(_glob);

var _get = require("lodash/get");

var _get2 = _interopRequireDefault(_get);

var _merge = require("lodash/merge");

var _merge2 = _interopRequireDefault(_merge);

var _memoize = require("lodash/memoize");

var _memoize2 = _interopRequireDefault(_memoize);

var _isObject = require("lodash/isObject");

var _isObject2 = _interopRequireDefault(_isObject);

var _isString = require("lodash/isString");

var _isString2 = _interopRequireDefault(_isString);

var _isFunction = require("lodash/isFunction");

var _isFunction2 = _interopRequireDefault(_isFunction);

var _helperInterface = require("./helperInterface");

var _helperInterface2 = _interopRequireDefault(_helperInterface);

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var local = {
  src: (0, _symbol2.default)("src"),
  name: (0, _symbol2.default)("name"),
  type: (0, _symbol2.default)("type"),
  theme: (0, _symbol2.default)("theme"),
  config: (0, _symbol2.default)("config"),
  helpers: (0, _symbol2.default)("helpers"),
  configPath: (0, _symbol2.default)("configPath"),
  helperInterface: (0, _symbol2.default)("helperInterface"),
  options: (0, _symbol2.default)("options")
};

var templateExt = "jade";
var configExt = "yml";
var compilerFn = _jade2.default.compileFile;
var compilerOptions = {
  pretty: true,
  self: true
};

var Component = function () {
  function Component() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, Component);

    this[local.helperInterface] = new _helperInterface2.default(this);
    this[local.options] = {
      configExt: options.configExt || configExt,
      templateExt: options.templateExt || templateExt,
      compilerFn: options.compilerFn || compilerFn,
      compilerOptions: options.compilerOptions || compilerOptions
    };
  }

  (0, _createClass3.default)(Component, [{
    key: "load",
    value: function load(config) {
      var _this = this;

      var theme = arguments.length <= 1 || arguments[1] === undefined ? "main" : arguments[1];

      return new _promise2.default(function (resolve, reject) {
        Component.readConfig(config, theme).then(function (data) {
          resolve(data);
        }, function (err) {
          reject(err);
        });
      }).then(function (data) {
        if (Component.isValidConfig(data)) {
          _this.setConfig(data);
          return _promise2.default.resolve({ component: _this });
        } else {
          return _promise2.default.reject(new Error("Invalid config in file"));
        }
      });
    }
  }, {
    key: "setConfig",
    value: function setConfig(_ref) {
      var configPath = _ref.configPath;
      var src = _ref.src;
      var type = _ref.type;
      var name = _ref.name;
      var config = _ref.config;
      var theme = _ref.theme;

      this[local.config] = config;
      this[local.src] = src;
      this[local.name] = name;
      this[local.type] = type;
      this[local.theme] = theme;
      this[local.configPath] = configPath;
      this[local.config].hasJS = this.hasIndexJS;
    }
  }, {
    key: "setHelpers",
    value: function setHelpers(helpers) {
      var _this2 = this;

      (0, _keys2.default)(helpers).forEach(function (helperName) {
        var helperFN = helpers[helperName];
        _this2[local.helpers] = _this2[local.helpers] || {};
        if ((0, _isFunction2.default)(helperFN)) {
          _this2[local.helpers][helperName] = helperFN.bind(_this2[local.helperInterface]);
        } else {
          throw new Error("Helper " + helperName + " must be a function");
        }
      });
    }
  }, {
    key: "getTemplate",
    value: function getTemplate() {
      var _this3 = this;

      var theme = arguments.length <= 0 || arguments[0] === undefined ? "main" : arguments[0];

      return this.getTemplateCompiler(theme).then(function (compiler) {
        var data = compiler(_this3[local.helpers]);
        return _promise2.default.resolve({
          component: _this3,
          data: data
        });
      });
    }
  }, {
    key: "getTemplatePath",
    value: function getTemplatePath() {
      var theme = arguments.length <= 0 || arguments[0] === undefined ? "main" : arguments[0];

      return this.findFileInComponentFolder(theme, this[local.options].templateExt);
    }
  }, {
    key: "getConfigPath",
    value: function getConfigPath() {
      var theme = arguments.length <= 0 || arguments[0] === undefined ? "main" : arguments[0];

      return this.findFileInComponentFolder(theme, this[local.options].configExt);
    }
  }, {
    key: "findFileInComponentFolder",
    value: function findFileInComponentFolder(name, ext) {
      var _this4 = this;

      return new _promise2.default(function (done, failed) {
        var fileName = name + "." + ext;
        var mask = (0, _utils.resolve)((0, _utils.join)(_this4.src, "**", fileName));
        (0, _glob2.default)(mask, function (err, result) {
          if (err) return failed(err);
          if (result.length && (0, _isString2.default)(result[0])) {
            done(result[0]);
          } else {
            failed(new Error("Can not find file \"" + fileName + "\" template for component \"" + _this4.name + "\""));
          }
        });
      });
    }
  }, {
    key: "getTemplateCompiler",
    value: function getTemplateCompiler(theme) {
      return this.getTemplatePath(theme).then(function (filePath) {
        var result = filePath ? compilerFn(filePath, compilerOptions) : null;
        return result ? _promise2.default.resolve(result) : _promise2.default.reject(new Error("compile fn error"));
      });
    }
  }, {
    key: "getConfigOption",
    value: function getConfigOption(path) {
      return path ? (0, _get2.default)(this[local.config], path) : null;
    }
  }, {
    key: "getAvailableThemes",
    value: function getAvailableThemes(themesList) {
      var _this5 = this;

      if (Array.isArray(themesList)) {
        var iterator = this.getThemeSearchResults.bind(this);
        var themesSearchPromises = themesList.map(iterator);
        return _promise2.default.all(themesSearchPromises).then(function (data) {
          return _promise2.default.resolve({
            component: _this5, data: data
          });
        });
      } else {
        return _promise2.default.reject(new Error("Invalid themes list"));
      }
    }
  }, {
    key: "getThemeSearchResults",
    value: function getThemeSearchResults(theme) {
      var _this6 = this;

      return new _promise2.default(function (done) {
        _this6.getTemplatePath(theme).then(function (path) {
          done({
            theme: theme,
            isAvailable: (0, _isString2.default)(path)
          });
        }, function () {
          done({
            theme: theme,
            isAvailable: false
          });
        });
      });
    }
  }, {
    key: "updateConfig",
    value: function updateConfig(sources) {
      if (sources) {
        this[local.config] = (0, _merge2.default)(this[local.config], sources);
        this[local.theme] = this.getConfigOption("route.theme");
      }
    }
  }, {
    key: "addWidgetToConfig",
    value: function addWidgetToConfig(name, type) {
      this.widgets = this.widgets || {};
      this.widgets[name] = { "default": type || name };
    }
  }, {
    key: "getIncludedWidgets",
    value: function getIncludedWidgets() {
      return this.widgets;
    }
  }, {
    key: "config",
    get: function get() {
      return this[local.config];
    }
  }, {
    key: "name",
    get: function get() {
      return this[local.name];
    }
  }, {
    key: "type",
    get: function get() {
      return this[local.type];
    }
  }, {
    key: "theme",
    get: function get() {
      return this[local.theme];
    }
  }, {
    key: "src",
    get: function get() {
      return this[local.src];
    }
  }, {
    key: "hasIndexJS",
    get: function get() {
      var filePath = (0, _utils.resolve)((0, _utils.join)(this.src, "index.js"));
      var jsxFilePath = (0, _utils.resolve)((0, _utils.join)(this.src, "index.jsx"));
      return _fs2.default.existsSync(filePath) || _fs2.default.existsSync(jsxFilePath);
    }
  }], [{
    key: "searchConfigFile",
    value: function searchConfigFile(config, theme) {
      return new _promise2.default(function (done, failed) {
        var configPath = (0, _utils.resolve)(config);
        var src = (0, _utils.dirname)(config);
        var type = (0, _utils.basename)((0, _utils.dirname)(src));
        var name = (0, _utils.basename)(src);
        var ext = (0, _utils.extname)(config);
        if (theme) {
          var theme_mask = (0, _utils.resolve)((0, _utils.join)(src, "**", theme + "." + ext));
          (0, _glob2.default)(theme_mask, function (err, result) {
            if (err) return failed(err);
            configPath = result.length ? result[0] : configPath;
            done({ configPath: configPath, src: src, type: type, name: name });
          });
        } else {
          done({ configPath: configPath, src: src, type: type, name: name });
        }
      });
    }
  }, {
    key: "readConfig",
    value: function readConfig(config, theme) {
      return new _promise2.default(function (done, failed) {
        if ((0, _isString2.default)(config)) {
          var searchConfigFile = Component.searchConfigFile(config, theme);
          searchConfigFile.then(function (_ref2) {
            var configPath = _ref2.configPath;
            var src = _ref2.src;
            var type = _ref2.type;
            var name = _ref2.name;

            _fs2.default.readFile(configPath, "utf8", function (err, data) {
              if (err) {
                failed(err);
              } else {
                var _config = _jsYaml2.default.safeLoad(data) || {};
                done({ configPath: configPath, src: src, type: type, name: name, theme: theme, config: _config });
              }
            });
          }, function (err) {
            failed(err);
          });
        } else {
          failed(new Error("Config path must be a string"));
        }
      });
    }
  }, {
    key: "isValidConfig",
    value: function isValidConfig(input) {
      if ((0, _isString2.default)(input.name) && (0, _isString2.default)(input.src) && (0, _isObject2.default)(input.config) && (0, _isString2.default)(input.configPath)) {
        return true;
      } else {
        throw new Error("@readConfig method should be return {name, src, config, configPath}");
      }
    }
  }]);
  return Component;
}();

exports.default = Component;