"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jsYaml = require("js-yaml");

var _fs = require("fs");

var _path = require("path");

var _has = require("lodash/has");

var _has2 = _interopRequireDefault(_has);

var _get = require("lodash/get");

var _get2 = _interopRequireDefault(_get);

var _set = require("lodash/set");

var _set2 = _interopRequireDefault(_set);

var _merge = require("lodash/merge");

var _merge2 = _interopRequireDefault(_merge);

var _isArray = require("lodash/isArray");

var _isArray2 = _interopRequireDefault(_isArray);

var _isObject = require("lodash/isObject");

var _isObject2 = _interopRequireDefault(_isObject);

var _cloneDeep = require("lodash/cloneDeep");

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _resoruces = require("./resoruces");

var _resoruces2 = _interopRequireDefault(_resoruces);

var _builder = require("./builder");

var _builder2 = _interopRequireDefault(_builder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var local = {
  config: Symbol("config"),
  resources: Symbol("resources"),
  builder: Symbol("builder"),
  tests: Symbol("tests")
};

function getDefaults(src, dest) {
  return {
    "src": src,
    "dest": dest,
    "source-maps": true,
    "target": "web",
    "devtool": "source-map"
  };
}

function normalizeConfig(config) {
  var normalized = (0, _cloneDeep2.default)(config);
  var loaders = normalized.loaders;
  if (loaders) {
    var normalizedLoaders = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(loaders)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var loader = _step.value;

        if (!(0, _isArray2.default)(loaders[loader])) {
          normalizedLoaders[loader] = [loaders[loader]];
        } else {
          normalizedLoaders[loader] = loaders[loader];
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    normalized.loaders = normalizedLoaders;
  }
  return normalized;
}

var Marmarosh = function () {
  function Marmarosh() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Marmarosh);

    var validation = Marmarosh.validate(config);

    if (!validation.isValid) {
      throw new Error("Invalid Marmarosh config. " + validation.errors.join(", "));
    }

    var defaultConfig = getDefaults(config.src, config.dest);

    this[local.config] = (0, _merge2.default)(defaultConfig, config);
    this[local.builder] = this[local.builder] || {};
  }

  _createClass(Marmarosh, [{
    key: "createResources",
    value: function createResources() {
      var customOptions = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var src = this.getSrc();
      var dest = this.getDest();
      var resourcesConfig = this.get("resources");
      var options = {
        stats: this.get("stats"),
        alias: this.get("alias"),
        resolve: this.get("resolve"),
        globals: this.get("globals")
      };
      var config = Object.assign({}, resourcesConfig, customOptions);
      return new _resoruces2.default(src, dest, config, options);
    }
  }, {
    key: "createBuilder",
    value: function createBuilder(name) {
      var resources = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      var src = this.getSrc();
      var dest = this.getDest();
      return new _builder2.default(name, { src: src, dest: dest, resources: resources });
    }
  }, {
    key: "getConfig",
    value: function getConfig() {
      return this[local.config];
    }
  }, {
    key: "getResources",
    value: function getResources() {
      if (!this[local.resources]) {
        this[local.resources] = this.createResources();
      }
      return this[local.resources];
    }
  }, {
    key: "getBuilder",
    value: function getBuilder(name, resources) {
      return this.createBuilder(name, resources);
    }
  }, {
    key: "createServer",
    value: function createServer(ServerConstructor) {
      var customOptions = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var configOptions = {
        src: this.getSrc(),
        dest: this.getDest(),
        host: this.get("host") || "localhost",
        port: this.get("port") || "3000",
        globals: this.get("globals")
      };

      var options = Object.assign({}, configOptions, customOptions);

      return new ServerConstructor(options);
    }
  }, {
    key: "getServer",
    value: function getServer(ServerConstructor, options) {
      return this.createServer(ServerConstructor, options);
    }

    // --------------------------------

  }, {
    key: "get",
    value: function get(key) {
      return (0, _get2.default)(this[local.config], key);
    }
  }, {
    key: "has",
    value: function has(key) {
      return !!this.get(key);
    }
  }, {
    key: "getDest",
    value: function getDest() {
      return this.get("dest");
    }
  }, {
    key: "getSrc",
    value: function getSrc() {
      return this.get("src");
    }
  }, {
    key: "isProduction",
    get: function get() {
      return process.env.NODE_ENV == "production";
    }
  }], [{
    key: "loadYml",
    value: function loadYml(configPath) {
      if (!(0, _fs.existsSync)(configPath)) {
        throw new Error("Marmarosh config \"" + configPath + "\" does not exist\"");
      }

      var configYml = (0, _fs.readFileSync)(configPath);
      var config = (0, _jsYaml.load)(configYml);
      var normalized = normalizeConfig(config);

      if (normalized.extend) {
        var currentDir = (0, _path.dirname)(configPath);
        var parentConfigPath = (0, _path.join)(currentDir, normalized.extend);
        var parentConfig = Marmarosh.loadYml(parentConfigPath);
        normalized = (0, _merge2.default)(parentConfig, normalized);
      }

      return normalized;
    }
  }, {
    key: "fromPath",
    value: function fromPath(configPath) {
      var config = Marmarosh.loadYml(configPath);
      return new Marmarosh(config);
    }
  }, {
    key: "validate",
    value: function validate(config) {
      var errors = [];
      if (!config.src) {
        errors.push("\"src\" is not defined");
      }
      if (!config.dest) {
        errors.push("\"dest\" is not defined");
      }
      return {
        isValid: !errors.length,
        errors: errors
      };
    }
  }]);

  return Marmarosh;
}();

exports.default = Marmarosh;