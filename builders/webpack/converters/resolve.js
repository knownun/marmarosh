'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isEmpty = require('lodash/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _isObject = require('lodash/isObject');

var _isObject2 = _interopRequireDefault(_isObject);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _baseConverter = require('../base-converter');

var _baseConverter2 = _interopRequireDefault(_baseConverter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ResolveCoverter = function (_BaseConverter) {
  _inherits(ResolveCoverter, _BaseConverter);

  function ResolveCoverter() {
    _classCallCheck(this, ResolveCoverter);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ResolveCoverter).apply(this, arguments));
  }

  _createClass(ResolveCoverter, [{
    key: 'getConfig',
    value: function getConfig(alias, resolve, extensions) {
      var config = null;

      if (!(0, _isEmpty2.default)(alias) && (0, _isObject2.default)(alias)) {
        config = config || {};
        config.alias = alias;
      }

      if (!(0, _isEmpty2.default)(resolve) && (0, _isArray2.default)(resolve)) {
        config = config || {};
        config.modulesDirectories = resolve;
      }

      if (!(0, _isEmpty2.default)(extensions) && (0, _isArray2.default)(extensions)) {
        config = config || {};
        config.extensions = [""].concat(extensions);
      }

      //config.fallback = [
      //  path.resolve("."), //project modules
      //  path.resolve("./libs"), //project modules
      //  path.resolve("./src"), //project modules
      //  path.resolve("./node_modules"), //project modules
      //  path.resolve(__dirname, "../../../../node_modules") // marmarosh modules
      //];

      return config;
    }
  }]);

  return ResolveCoverter;
}(_baseConverter2.default);

exports.default = ResolveCoverter;