"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

//import DevComponentClass from "./components/development_component"


var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _helpers = require("../../../utils/helpers");

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

var _production_component = require("./components/production_component");

var _production_component2 = _interopRequireDefault(_production_component);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var local = {
  events: Symbol("events"),
  normalized: Symbol("normalized")
};

var Builder = function () {
  function Builder(config) {
    _classCallCheck(this, Builder);

    this[local.events] = new _events2.default.EventEmitter();
    this.config = this.normalize(config);
  }

  _createClass(Builder, [{
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

          (0, _forOwn2.default)(config.events, function (fn, key) {
            _this.on(key, fn);
          });

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
        //console.log("ERROR"); //TODO error handler
      }

      return normalized;
    }
  }, {
    key: "getNewFilename",
    value: function getNewFilename(instance, ext, theme) {
      var name = instance.getName();
      var dir = instance.getType() + "/" + instance.getName();
      return theme ? dir + "/themes/" + theme + "/" + name + "." + ext : dir + "/" + name + "." + ext;
    }
  }, {
    key: "createFile",
    value: function createFile(dir, fileName, data) {
      var folder = (0, _helpers.join)(dir, (0, _helpers.dirname)(fileName));
      _mkdirp2.default.sync(folder);
      _fs2.default.writeFileSync((0, _helpers.join)(dir, fileName), data, "utf8");
      return true;
    }
  }, {
    key: "getVars",
    value: function getVars(input, properties, map) {
      var output = {};
      (0, _forOwn2.default)(input, function (value, key) {
        if (!(0, _startsWith2.default)(key, '$')) {
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
    key: "createCSHTML",
    value: function createCSHTML(instance, output, theme) {
      var name = this.getNewFilename(instance, "cshtml", theme);
      var data = instance.getHTML(theme || "main") || "";
      return this.createFile(output, name, data);
    }
  }, {
    key: "createJSON",
    value: function createJSON(instance, output, theme) {
      var name = this.getNewFilename(instance, "json", theme);
      var config = instance.getConfig();

      var getVars = this.getVars;

      var data = {};

      if (config.isMasterPage) {
        data.isMasterPage = config.isMasterPage;
      }

      if (instance.hasIndexJS) {
        data.hasJs = true;
      }

      if ((0, _startsWith2.default)(instance.getName(), "react")) {
        data.isReact = true;
      }

      if ((0, _isObject2.default)(config.template_options)) {
        data.template_options = getVars(config.template_options, ["default", "values"]);
      }

      if ((0, _isObject2.default)(config.layout_options)) {
        data.layout_options = getVars(config.layout_options, ["default", "values"]);
      }

      if ((0, _isObject2.default)(config.script_options)) {
        data.script_options = getVars(config.script_options, ["default", "values"]);
      }

      if ((0, _isObject2.default)(config.strings)) {
        data.strings = getVars(config.strings, ["default"], "default");
      }

      if ((0, _isObject2.default)(config.images)) {
        data.images = getVars(config.images, ["default"], "default");
      }

      if ((0, _isObject2.default)(config.links)) {
        data.links = getVars(config.links, ["default"], "default");
      }

      data.widgets = instance.widgets || {};

      if (theme) {
        JSON.stringify(instance.widgets);
      }

      if ((0, _isObject2.default)(config.widgets)) {
        data.widgets = (0, _merge2.default)(data.widgets, config.widgets);
      }

      return this.createFile(output, name, JSON.stringify(data, null, 2));
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
  }, {
    key: "run",
    value: function run(cb) {
      var _this2 = this;

      this.config.forEach(function (config) {
        try {
          (function () {
            var Constructor = _production_component2.default;
            var components = config.src;
            var output = config.dest;
            var themes = _this2.getSecondaryThemesConfig(config.themes);
            if (components) {
              components.forEach(function (filePath, index) {
                var instance = new Constructor((0, _helpers.normalize)(filePath), {
                  builder: {
                    serverReplace: config.serverReplace
                  }
                });
                _this2.createCSHTML(instance, output);
                _this2.createJSON(instance, output);

                themes.forEach(function (name) {
                  if (instance.hasTemplateForTheme(name) || instance.hasConfigForTheme(name)) {
                    var themeInstance = new Constructor((0, _helpers.normalize)(filePath), {
                      route: {
                        theme: name
                      },
                      builder: {
                        serverReplace: config.serverReplace
                      }
                    });
                    _this2.createCSHTML(themeInstance, output, name);
                    _this2.createJSON(themeInstance, output, name);
                  }
                });

                var itemIndex = index + 1;
                var allLength = components.length;
                var percentage = itemIndex / allLength;
                var msg = itemIndex + "/" + allLength + " built modules";

                _this2.emit("done", { percentage: percentage, msg: msg });
              });
              _this2.emit("end", { files: components.length });
            }
          })();
        } catch (e) {
          _this2.emit("error", { message: e.message });
        }
      });

      cb();
    }
  }, {
    key: "config",
    get: function get() {
      return this[local.normalized];
    },
    set: function set(data) {
      this[local.normalized] = data;
    }
  }]);

  return Builder;
}();

exports.default = Builder;