"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _url = require("url");

var _glob = require("glob");

var _cloneDeep = require("lodash/cloneDeep");

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _merge = require("lodash/merge");

var _merge2 = _interopRequireDefault(_merge);

var _get = require("lodash/get");

var _get2 = _interopRequireDefault(_get);

var _isArray = require("lodash/isArray");

var _isArray2 = _interopRequireDefault(_isArray);

var _isString = require("lodash/isString");

var _isString2 = _interopRequireDefault(_isString);

var _uniq = require("lodash/uniq");

var _uniq2 = _interopRequireDefault(_uniq);

var _concat = require("lodash/concat");

var _concat2 = _interopRequireDefault(_concat);

var _helpers = require("../utils/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var local = {
  src: Symbol("src"),
  dest: Symbol("dest"),
  key: Symbol("key"),
  normalized: Symbol("normalized")
};

var Resource = function () {
  function Resource(src, dest, key, config, options) {
    _classCallCheck(this, Resource);

    this[local.src] = src;
    this[local.dest] = dest;
    this[local.key] = key;
    this[local.normalized] = this.normalize(key, config, options);
  }

  _createClass(Resource, [{
    key: "normalize",
    value: function normalize(key, config, options) {

      var normalized = {
        originalSourceIsArray: false
      };

      if (!config.src) {
        config.src = ".";
      }

      if ((0, _isArray2.default)(config.src)) {
        normalized.src = config.src;
        normalized.originalSourceIsArray = true;
      } else {
        normalized.src = [config.src];
      }

      if (config.dest) {
        if (!(0, _isString2.default)(config.dest)) {
          throw new Error("Wrong configuration for \"" + key + "\" resource: \"dest\" should be string");
        }
        normalized.dest = config.dest;
      } else {
        if (!(0, _isString2.default)(config.src)) {
          throw new Error("Wrong configuration for \"" + key + "\" resource: \"dest\" is not defined and could not calculated");
        } else {
          normalized.dest = config.src;
        }
      }

      normalized.names = normalized.src.map(function (path) {
        return (0, _helpers.basename)(path);
      });

      normalized.destDirName = (0, _helpers.dirname)(normalized.dest);

      normalized.destName = (0, _helpers.basename)(normalized.dest);

      if (!normalized.originalSourceIsArray) {
        normalized.destName = normalized.names[0];
      }

      var locations = normalized.src.map(function (path) {
        return (0, _helpers.dirname)(path);
      });
      normalized.locations = (0, _uniq2.default)(locations);

      if (config.mask) {
        normalized.mask = (0, _isArray2.default)(config.mask) ? config.mask : [config.mask];
      } else {
        normalized.mask = null;
      }

      normalized.options = config.options || {};

      normalized.preset = config.preset || null;

      normalized.alias = (0, _merge2.default)({}, config.alias, options.alias) || null;

      normalized.resolve = (0, _concat2.default)([], config.resolve, options.resolve);

      normalized.extensions = config.extensions || null;

      normalized.target = config.target || null;

      normalized.devtool = config.devtool || null;

      normalized.stats = config.stats || options.stats || null;

      return normalized;
    }
  }, {
    key: "getConfig",
    value: function getConfig() {
      return (0, _cloneDeep2.default)(this[local.normalized]);
    }
  }, {
    key: "getName",
    value: function getName() {
      var normalized = this[local.normalized];
      var names = null;

      if (normalized.originalSourceIsArray) {
        names = normalized.names;
      } else {
        names = normalized.names[0];
      }

      return names;
    }
  }, {
    key: "getKey",
    value: function getKey() {
      return this[local.key];
    }
  }, {
    key: "getDestName",
    value: function getDestName() {
      return this[local.normalized].destName;
    }
  }, {
    key: "hasDestName",
    value: function hasDestName() {
      return !!this[local.normalized].destName;
    }
  }, {
    key: "getProjectSrc",
    value: function getProjectSrc() {
      return this[local.src];
    }
  }, {
    key: "getProjectDest",
    value: function getProjectDest() {
      return this[local.dest];
    }
  }, {
    key: "getMask",
    value: function getMask() {
      var _this = this;

      var normalized = this[local.normalized];
      var mask = null;

      if (normalized.mask) {
        (function () {
          var src = _this[local.src];

          if ((0, _isArray2.default)(normalized.mask)) {
            mask = normalized.mask.map(function (path) {
              return (0, _helpers.join)(src, path);
            });
          } else {
            mask = (0, _helpers.join)(src, normalized.mask);
          }
        })();
      } else {
        mask = this.getSrc();
      }

      return mask;
    }
  }, {
    key: "getRelativeSrc",
    value: function getRelativeSrc() {
      var normalized = this[local.normalized];
      var relativeSrc = null;

      if (normalized.originalSourceIsArray) {
        relativeSrc = normalized.src;
      } else {
        relativeSrc = normalized.src[0];
      }

      return relativeSrc;
    }
  }, {
    key: "getSrc",
    value: function getSrc() {
      var relativeSrc = this.getRelativeSrc();
      var src = this[local.src];
      var resourceSrc = null;

      if ((0, _isArray2.default)(relativeSrc)) {
        resourceSrc = relativeSrc.map(function (path) {
          return (0, _helpers.join)(src, path);
        });
      } else {
        resourceSrc = (0, _helpers.join)(src, relativeSrc);
      }

      return Resource.collectScripts(resourceSrc, this[local.key]);
    }
  }, {
    key: "getRelativeDest",
    value: function getRelativeDest() {
      return this[local.normalized].dest;
    }
  }, {
    key: "getDest",
    value: function getDest() {
      var relativeDest = this.getRelativeDest();
      var dest = this[local.dest];
      return (0, _helpers.join)(dest, relativeDest);
    }
  }, {
    key: "getRelativeLocation",
    value: function getRelativeLocation() {
      var normalized = this[local.normalized];
      var relativeLocation = null;

      if (normalized.originalSourceIsArray) {
        relativeLocation = normalized.locations;
      } else {
        relativeLocation = normalized.locations[0];
      }

      return relativeLocation;
    }
  }, {
    key: "getLocation",
    value: function getLocation() {
      var relativeLocation = this.getRelativeLocation();
      var src = this[local.src];

      var location = null;
      if ((0, _isArray2.default)(relativeLocation)) {
        location = relativeLocation.map(function (path) {
          return (0, _helpers.join)(src, path);
        });
      } else {
        location = (0, _helpers.join)(src, relativeLocation);
      }

      return location;
    }
  }, {
    key: "getRelativeTarget",
    value: function getRelativeTarget() {
      return this[local.normalized].destDirName;
    }
  }, {
    key: "getTarget",
    value: function getTarget() {
      var relativeTarget = this.getRelativeTarget();
      var dest = this[local.dest];

      return (0, _helpers.join)(dest, relativeTarget);
    }
  }, {
    key: "getOptions",
    value: function getOptions(optionPath) {
      var normalized = this[local.normalized];
      var options = null;

      if (!optionPath) {
        options = normalized.options;
      } else {
        options = (0, _get2.default)(normalized.options, optionPath) || null;
      }

      return options;
    }
  }, {
    key: "getUrl",
    value: function getUrl() {
      var target = this.getRelativeTarget();
      var destName = this.getDestName();
      var url = null;
      if (!destName) {
        var src = this.getSrc();
        if ((0, _isArray2.default)(src)) {
          url = [];
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = src[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var resourcePath = _step.value;

              var resourceUrl = (0, _url.resolve)("/", target, (0, _helpers.basename)(resourcePath));
              url.push(resourceUrl);
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
        } else {
          url = (0, _url.resolve)("/", target, (0, _helpers.basename)(src));
        }
      } else {
        url = (0, _url.resolve)("/", target, destName);
      }
      return url;
    }
  }, {
    key: "getPresetName",
    value: function getPresetName() {
      return this[local.normalized].preset;
    }
  }, {
    key: "getBuilderName",
    value: function getBuilderName() {
      return this[local.normalized].builder;
    }
  }, {
    key: "devtool",
    get: function get() {
      return this.getConfig().devtool || "source-map";
    }
  }, {
    key: "target",
    get: function get() {
      return this.getConfig().target || "web";
    }
  }, {
    key: "src",
    get: function get() {
      return this.getSrc();
    }
  }, {
    key: "dest",
    get: function get() {
      return this.getDest();
    }
  }, {
    key: "relativeDest",
    get: function get() {
      return this.getRelativeDest();
    }
  }, {
    key: "extentions",
    get: function get() {
      return this.getConfig().extentions;
    }
  }, {
    key: "alias",
    get: function get() {
      return this.getConfig().alias;
    }
  }, {
    key: "resolve",
    get: function get() {
      return this.getConfig().resolve;
    }
  }, {
    key: "preset",
    get: function get() {
      return this.getConfig().preset;
    }
  }, {
    key: "stats",
    get: function get() {
      return this.getConfig().stats;
    }
  }], [{
    key: "collectScripts",
    value: function collectScripts(paths, key) {
      if (!(0, _isArray2.default)(paths)) {
        paths = [paths];
      }

      var scripts = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = paths[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var path = _step2.value;

          var collected = (0, _glob.sync)(path, {
            nosort: true
          });

          if (collected.length) {
            var processedScripts = collected.map(function (script) {
              return "./" + script;
            });
            scripts = scripts.concat(processedScripts);
          } else {
            throw new Error("There are no scripts for \"" + key + "\" resource by \"" + path + "\" path");
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return scripts;
    }
  }]);

  return Resource;
}();

exports.default = Resource;