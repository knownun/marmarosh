"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _webpack = require("webpack");

var _webpack2 = _interopRequireDefault(_webpack);

var _isArray = require("lodash/isArray");

var _isArray2 = _interopRequireDefault(_isArray);

var _webpackLogPlugin = require("./plugins/webpack-log-plugin");

var _webpackLogPlugin2 = _interopRequireDefault(_webpackLogPlugin);

var _webpackSplitPlugin = require("./plugins/webpack-split-plugin");

var _webpackSplitPlugin2 = _interopRequireDefault(_webpackSplitPlugin);

var _CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");

var _CommonsChunkPlugin2 = _interopRequireDefault(_CommonsChunkPlugin);

var _baseBuilder = require("../base-builder");

var _baseBuilder2 = _interopRequireDefault(_baseBuilder);

var _loaders = require("./converters/loaders");

var _loaders2 = _interopRequireDefault(_loaders);

var _preloaders = require("./converters/preloaders");

var _preloaders2 = _interopRequireDefault(_preloaders);

var _output = require("./converters/output");

var _output2 = _interopRequireDefault(_output);

var _resolve = require("./converters/resolve");

var _resolve2 = _interopRequireDefault(_resolve);

var _optimize = require("./converters/optimize");

var _optimize2 = _interopRequireDefault(_optimize);

var _entry = require("./converters/entry");

var _entry2 = _interopRequireDefault(_entry);

var _webpackScripts = require("./presets/webpack-scripts");

var _webpackScripts2 = _interopRequireDefault(_webpackScripts);

var _webpackStyles = require("./presets/webpack-styles");

var _webpackStyles2 = _interopRequireDefault(_webpackStyles);

var _helpers = require("../../utils/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var webpackPresets = new Map();

webpackPresets.set("webpack-scripts", _webpackScripts2.default);
webpackPresets.set("webpack-styles", _webpackStyles2.default);

var local = {
  processedConfig: Symbol("processed"),
  instance: Symbol("instance")
};

var WebpackBuilder = function (_BaseBuilder) {
  _inherits(WebpackBuilder, _BaseBuilder);

  function WebpackBuilder() {
    _classCallCheck(this, WebpackBuilder);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(WebpackBuilder).apply(this, arguments));
  }

  _createClass(WebpackBuilder, [{
    key: "createConfig",
    value: function createConfig() {
      var config = this.config;

      if (!(0, _isArray2.default)(config.resources)) {
        config.resources = [config.resources];
      }

      return config.resources.map(this.createChildConfig.bind(this));
    }
  }, {
    key: "createChildConfig",
    value: function createChildConfig(resource) {
      var _this2 = this;

      var preset = webpackPresets.get(resource.preset);

      var src = this.config.src;
      var dest = this.config.dest;

      var debug = !this.isProduction;
      var bail = this.isProduction;
      var devtool = resource.devtool;
      var target = resource.target;

      var resourceSrc = resource.src;
      var resourceRelativeDest = resource.relativeDest;

      var entryConverter = new _entry2.default(src, dest);
      var entry = entryConverter.getConfig(resourceSrc, resourceRelativeDest);

      var loadersConverter = new _loaders2.default(src, dest);
      var loaders = loadersConverter.getConfig(preset.loaders);
      var loadersPlugins = loadersConverter.getPlugins();

      var preloadersConverter = new _preloaders2.default(src, dest);
      var preloaders = preloadersConverter.getConfig(preset.preloaders);

      var outputConverter = new _output2.default(src, dest);
      var output = outputConverter.getConfig(resource.output);

      var resolveConverter = new _resolve2.default(src, dest);
      var resolve = resolveConverter.getConfig(resource.alias, resource.resolve, resource.extensions);

      // plugins
      var optimizeConverter = new _optimize2.default(src, dest);
      var optimize = optimizeConverter.getConfig(!debug);

      var config = {
        bail: bail,
        devtool: devtool,
        target: target,
        output: output,
        debug: debug,
        plugins: [],
        module: {}
      };

      if (resolve) {
        config.resolve = resolve;
      }

      if (entry) {
        config.entry = entry;
      }

      if (loaders) {
        config.module.loaders = loaders;
      }

      if (loadersPlugins) {
        config.plugins = config.plugins.concat(loadersPlugins);
      }

      if (preloaders) {
        config.module.preLoaders = preloaders;
      }

      if (optimize) {
        config.plugins.push(optimize);
      }

      /**
       * console log Plugin. apply "done" and "invalid"
       */
      var logPlugin = new _webpackLogPlugin2.default(function (event, params) {
        _this2.emit(event, params);
      }, { key: resource.getKey(), extendedFormat: resource.stats });

      config.plugins.push(logPlugin);

      config.plugins.push(new _webpack2.default.ProvidePlugin({
        $: "jquery"
      }));

      config.plugins.push(new _webpack2.default.optimize.DedupePlugin());

      config.plugins.push(new _webpack2.default.ProgressPlugin(function (percentage, msg) {
        _this2.emit("build.waiting", { key: resource.getKey(), percentage: percentage, msg: msg });
      }));

      var preDefinedVars = {
        DEBUG: JSON.stringify(JSON.parse(this.env != "production" || "false")),
        PRODUCTION: JSON.stringify(JSON.parse(this.env == "production" || "false")),
        "process.env.NODE_ENV": JSON.stringify(JSON.parse(this.env || "development"))
      };

      config.plugins.push(new _webpack2.default.DefinePlugin(preDefinedVars));

      var split = resource.getOptions("split");

      if (split) {
        var relativeTarget = resource.getRelativeTarget();
        var splitConfig = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.keys(split)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var name = _step.value;

            splitConfig.push({
              name: (0, _helpers.join)(relativeTarget, name),
              path: split[name]
            });
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

        console.dir(splitConfig, { colors: 1 });
        var splitPlugin = new _webpackSplitPlugin2.default(splitConfig);
        config.plugins.push(splitPlugin);
      }

      return config;
    }
  }, {
    key: "createInstance",
    value: function createInstance() {
      var config = this.createConfig();
      return (0, _webpack2.default)(config);
    }
  }, {
    key: "getConfig",
    value: function getConfig() {
      if (!this[local.processedConfig]) {
        this[local.processedConfig] = this.createConfig();
      }
      return this[local.processedConfig];
    }
  }, {
    key: "getWebpackInstance",
    value: function getWebpackInstance() {
      if (!this[local.instance]) {
        this[local.instance] = this.createInstance();
      }
      return this[local.instance];
    }
  }, {
    key: "run",
    value: function run(cb) {
      this.getWebpackInstance().run(cb);
    }
  }]);

  return WebpackBuilder;
}(_baseBuilder2.default);

exports.default = WebpackBuilder;