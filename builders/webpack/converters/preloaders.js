"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _isArray = require("lodash/isArray");

var _isArray2 = _interopRequireDefault(_isArray);

var _isFunction = require("lodash/isFunction");

var _isFunction2 = _interopRequireDefault(_isFunction);

var _merge = require("lodash/merge");

var _merge2 = _interopRequireDefault(_merge);

var _helpers = require("../../../utils/helpers");

var _baseConverter = require("../base-converter");

var _baseConverter2 = _interopRequireDefault(_baseConverter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var webpackLoaders = new Map();

webpackLoaders.set("eslint", "eslint-loader");
webpackLoaders.set("less", "less-loader");

var PreloadersConverter = function (_BaseConverter) {
  _inherits(PreloadersConverter, _BaseConverter);

  function PreloadersConverter() {
    _classCallCheck(this, PreloadersConverter);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(PreloadersConverter).apply(this, arguments));
  }

  _createClass(PreloadersConverter, [{
    key: "getConfig",
    value: function getConfig(loaders) {
      var converted = [];

      if (loaders) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.keys(loaders)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var loader = _step.value;

            if (!webpackLoaders.has(loader)) {
              throw new Error("Preloader \"" + loader + "\" doest not exist");
            }

            var loaderPattern = loaders[loader];
            var patterns = null;
            if ((0, _isArray2.default)(loaderPattern)) {
              patterns = loaderPattern;
            } else {
              patterns = [loaderPattern];
            }

            var customLoaderMethodName = PreloadersConverter.getPreLoaderMethodName(loader);
            var customLoaderMethod = PreloadersConverter[customLoaderMethodName] || null;
            var loaderMethod = (0, _isFunction2.default)(customLoaderMethod) ? customLoaderMethod.bind(this) : PreloadersConverter.getLoader.bind(this);

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = patterns[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var pattern = _step2.value;

                var loaderConfig = loaderMethod(pattern, loader);
                converted.push(loaderConfig);
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
      }

      return converted;
    }
  }], [{
    key: "getPreLoaderMethodName",
    value: function getPreLoaderMethodName(loader) {
      return "get" + (loader.charAt(0).toUpperCase() + loader.substr(1).toLowerCase()) + "Loader";
    }
  }, {
    key: "getLoader",
    value: function getLoader(pattern, loader) {
      var webpackLoader = webpackLoaders.get(loader);

      var config = pattern.replace(/\//g, _helpers.sep).split("?");

      var test = config.shift() || null;
      var query = config.shift() || null;

      var converted = {
        test: new RegExp(test),
        loader: webpackLoader
      };

      if (query) {
        converted.query = query;
      }

      return converted;
    }
  }, {
    key: "getEslintLoader",
    value: function getEslintLoader(pattern, loader) {
      var originalConfig = PreloadersConverter.getLoader(pattern, loader);
      originalConfig.exclude = /(node_modules|bower_components)/;
      return originalConfig;
    }
  }, {
    key: "getLessLoader",
    value: function getLessLoader(pattern, loader) {
      var originalConfig = PreloadersConverter.getLoader(pattern, loader);
      originalConfig.query = {
        paths: [(0, _helpers.join)((0, _helpers.resolve)(this.src), "../"), (0, _helpers.join)((0, _helpers.resolve)(this.src), "../libs"), (0, _helpers.join)((0, _helpers.resolve)(this.src))]
      };
      return originalConfig;
    }
  }]);

  return PreloadersConverter;
}(_baseConverter2.default);

exports.default = PreloadersConverter;