'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

var _UglifyJsPlugin2 = _interopRequireDefault(_UglifyJsPlugin);

var _baseConverter = require('../base-converter');

var _baseConverter2 = _interopRequireDefault(_baseConverter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OptimizeConverter = function (_BaseConverter) {
  _inherits(OptimizeConverter, _BaseConverter);

  function OptimizeConverter() {
    _classCallCheck(this, OptimizeConverter);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(OptimizeConverter).apply(this, arguments));
  }

  _createClass(OptimizeConverter, [{
    key: 'getConfig',
    value: function getConfig(optimize) {
      var optimizePlugin = null;

      if (optimize) {
        optimizePlugin = new _UglifyJsPlugin2.default({
          mangle: {
            except: ['$', 'exports', 'require']
          },
          compress: {
            warnings: false
          }
        });
      }

      return optimizePlugin;
    }
  }]);

  return OptimizeConverter;
}(_baseConverter2.default);

exports.default = OptimizeConverter;