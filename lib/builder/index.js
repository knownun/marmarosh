"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

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

var _mkdirp = require("mkdirp");

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _events = require("events");

var _events2 = _interopRequireDefault(_events);

var _isArray = require("lodash/isArray");

var _isArray2 = _interopRequireDefault(_isArray);

var _isObject = require("lodash/isObject");

var _isObject2 = _interopRequireDefault(_isObject);

var _isEmpty = require("lodash/isEmpty");

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _isUndefined = require("lodash/isUndefined");

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _pick = require("lodash/pick");

var _pick2 = _interopRequireDefault(_pick);

var _forOwn = require("lodash/forOwn");

var _forOwn2 = _interopRequireDefault(_forOwn);

var _startsWith = require("lodash/startsWith");

var _startsWith2 = _interopRequireDefault(_startsWith);

var _mapValues = require("lodash/mapValues");

var _mapValues2 = _interopRequireDefault(_mapValues);

var _merge = require("lodash/merge");

var _merge2 = _interopRequireDefault(_merge);

var _glob = require("glob");

var _glob2 = _interopRequireDefault(_glob);

var _component = require("./component");

var _component2 = _interopRequireDefault(_component);

var _tplHelpers = require("./tplHelpers");

var _tplHelpers2 = _interopRequireDefault(_tplHelpers);

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var local = {
  events: (0, _symbol2.default)("events"),
  normalized: (0, _symbol2.default)("normalized")
};

var Builder = function () {
  function Builder(config) {
    (0, _classCallCheck3.default)(this, Builder);

    this[local.events] = new _events2.default.EventEmitter();
    this[local.normalized] = this.normalize(config);
    this.templateHelpers = Builder.getHelpers(config);
  }

  (0, _createClass3.default)(Builder, [{
    key: "on",
    value: function on(event, fn) {
      this[local.events].on(event, fn);
      return this;
    }
  }, {
    key: "once",
    value: function once(event, fn) {
      this[local.events].once(event, fn);
      return this;
    }
  }, {
    key: "remove",
    value: function remove(event) {
      this[local.events].removeAllListeners(event);
      return this;
    }
  }, {
    key: "emit",
    value: function emit(event, params) {
      this[local.events].emit(event, params);
      return this;
    }
  }, {
    key: "normalize",
    value: function normalize(data) {
      var _this = this;

      var normalized = [];

      if ((0, _isArray2.default)(data)) {
        normalized = data.map(function (config) {

          config.events = {
            done: function done(_ref) {
              var msg = _ref.msg;

              console.log("Building: " + msg);
            },
            error: function error(_ref2) {
              var message = _ref2.message;

              console.log("Error: " + message);
            }
          };

          (0, _forOwn2.default)(config.events, function (fn, key) {
            _this.on(key, fn);
          });

          config.src = _glob2.default.sync(config.src);

          return {
            root: config.root,
            src: config.src,
            dest: config.dest,
            debug: config.debug,
            themes: config.themes,
            serverReplace: config.serverReplace
          };
        });
      } else {
        normalized = this.normalize([data]);
      }
      return normalized;
    }
  }, {
    key: "run",
    value: function run() {
      var _this2 = this;

      var errHandler = function errHandler(err) {
        return _this2.emit("error", err);
      };

      this.config.forEach(function (config) {
        var Constructor = _component2.default;
        var components = config.src;
        var themes = Builder.getSecondaryThemesConfig(config.themes);
        if (components) {
          components.forEach(function (filePath) {
            var MainInstance = new Constructor();
            var MainConfigPath = (0, _utils.normalize)(filePath);
            MainInstance.setHelpers(_this2.templateHelpers);

            MainInstance.load(MainConfigPath).then(function (_ref3) {
              var component = _ref3.component;

              return component.getTemplate();
            }, errHandler).then(function (_ref4) {
              var component = _ref4.component;
              var data = _ref4.data;


              var dest = config.dest;
              var name = component.name;
              var type = component.type;

              var cshtmlFilePath = (0, _utils.join)(dest, type, name, name + ".cshtml");
              var jsonFilePath = (0, _utils.join)(dest, type, name, name + ".json");

              var jsonData = Builder.createJSON({
                name: component.name,
                config: component.config,
                includes: component.widgets
              });

              Builder.createFile(cshtmlFilePath, data);
              Builder.createFile(jsonFilePath, jsonData);

              return _promise2.default.resolve({ component: component });
            }, errHandler).then(function (_ref5) {
              var component = _ref5.component;

              return component.getAvailableThemes(themes);
            }, errHandler).then(function (_ref6) {
              var component = _ref6.component;
              var data = _ref6.data;

              data.forEach(function (_ref7) {
                var theme = _ref7.theme;
                var isAvailable = _ref7.isAvailable;

                if (isAvailable) {
                  (function () {
                    var ThemeInstance = new Constructor();
                    ThemeInstance.setHelpers(_this2.templateHelpers);

                    component.getConfigPath(theme).then(function (path) {
                      return _promise2.default.resolve(path);
                    }, function () {
                      return _promise2.default.resolve(MainConfigPath);
                    }).then(function (themeConfigPath) {
                      ThemeInstance.load(themeConfigPath).then(function (_ref8) {
                        var component = _ref8.component;

                        return component.getTemplate(theme);
                      }, errHandler).then(function (_ref9) {
                        var component = _ref9.component;
                        var data = _ref9.data;


                        var dest = config.dest;

                        var type = MainInstance.type;
                        var name = MainInstance.name;

                        var cshtmlFilePath = (0, _utils.join)(dest, type, name, "themes", theme, name + ".cshtml");
                        var jsonFilePath = (0, _utils.join)(dest, type, name, "themes", theme, name + ".json");

                        var jsonData = Builder.createJSON({
                          name: component.name,
                          config: component.config,
                          includes: component.widgets,
                          hasJS: MainInstance.hasIndexJS
                        });

                        Builder.createFile(cshtmlFilePath, data);
                        Builder.createFile(jsonFilePath, jsonData);
                      }, errHandler);
                    }).catch(errHandler);
                  })();
                }
              });
            }).catch(errHandler);
          });
        }
      });
    }
  }, {
    key: "config",
    get: function get() {
      return this[local.normalized];
    }
  }], [{
    key: "getHelpers",
    value: function getHelpers() {
      var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return (0, _merge2.default)({}, _tplHelpers2.default, config.helpers);
    }
  }, {
    key: "createFile",
    value: function createFile(filePath, data) {
      return new _promise2.default(function (done, failled) {
        (0, _mkdirp2.default)((0, _utils.dirname)(filePath), function (err) {
          if (err) return failled(err);
          _fs2.default.writeFile(filePath, data, "utf8", function (err) {
            if (err) return failled(err);
            done(filePath);
          });
        });
      });
    }
  }, {
    key: "createJSON",
    value: function createJSON(_ref10) {
      var name = _ref10.name;
      var config = _ref10.config;
      var includes = _ref10.includes;
      var hasJS = _ref10.hasJS;

      var data = {};

      if (config.isMasterPage) {
        data.isMasterPage = config.isMasterPage;
      }

      if (config.hasJS || hasJS) {
        data.hasJs = true;
      }

      if ((0, _startsWith2.default)(name, "react")) {
        data.isReact = true;
      }

      if ((0, _isObject2.default)(config.template_options)) {
        data.template_options = Builder.getVars(config.template_options, ["default", "values"]);
      }

      if ((0, _isObject2.default)(config.layout_options)) {
        data.layout_options = Builder.getVars(config.layout_options, ["default", "values"]);
      }

      if ((0, _isObject2.default)(config.script_options)) {
        data.script_options = Builder.getVars(config.script_options, ["default", "values"]);
      }

      if ((0, _isObject2.default)(config.strings)) {
        data.strings = Builder.getVars(config.strings, ["default"], "default");
      }

      if ((0, _isObject2.default)(config.images)) {
        data.images = Builder.getVars(config.images, ["default"], "default");
      }

      if ((0, _isObject2.default)(config.links)) {
        data.links = Builder.getVars(config.links, ["default"], "default");
      }

      data.widgets = (0, _merge2.default)(includes, config.widgets);

      return (0, _stringify2.default)(data, null, 2);
    }
  }, {
    key: "getVars",
    value: function getVars(input, properties, map) {
      var output = {};
      (0, _forOwn2.default)(input, function (value, key) {
        if (!(0, _startsWith2.default)(key, "$")) {
          if ((0, _isObject2.default)(value)) {
            var obj = null;
            if (!(0, _isUndefined2.default)(value)) {
              obj = properties ? (0, _pick2.default)(value, properties) : value;
              if (!(0, _isEmpty2.default)(obj)) {
                output[key] = obj;
              }
            }
          } else if (!(0, _isEmpty2.default)(value)) {
            output[key] = value;
          }
        }
      });

      if (map) {
        (0, _mapValues2.default)(output, map);
      }

      return output;
    }
  }, {
    key: "getSecondaryThemesConfig",
    value: function getSecondaryThemesConfig(config) {
      var normalizedSecondaryConfig = [];
      (0, _forOwn2.default)(config, function (val, key) {
        if ((0, _startsWith2.default)(val, "?")) {
          normalizedSecondaryConfig.push(key);
        }
      });
      return normalizedSecondaryConfig;
    }
  }]);
  return Builder;
}();

exports.default = Builder;