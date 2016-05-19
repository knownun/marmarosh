"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = require("lodash/get");

var _get2 = _interopRequireDefault(_get);

var _forOwn = require("lodash/forOwn");

var _forOwn2 = _interopRequireDefault(_forOwn);

var _isObject = require("lodash/isObject");

var _isObject2 = _interopRequireDefault(_isObject);

var _startsWith = require("lodash/startsWith");

var _startsWith2 = _interopRequireDefault(_startsWith);

var _base_component = require("./base_component");

var _base_component2 = _interopRequireDefault(_base_component);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ProdComponent = function (_Base) {
  _inherits(ProdComponent, _Base);

  function ProdComponent() {
    _classCallCheck(this, ProdComponent);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ProdComponent).apply(this, arguments));
  }

  _createClass(ProdComponent, [{
    key: "getPropsFrom",
    value: function getPropsFrom(input, propertyPath) {
      var output = {};
      if ((0, _isObject2.default)(input)) {
        (0, _forOwn2.default)(input, function (value, key) {
          if (!(0, _startsWith2.default)(key, "$")) {
            output[key] = (0, _isObject2.default)(value) && propertyPath ? (0, _get2.default)(value, propertyPath) : value;
          }
        });
      }
      return output;
    }
  }, {
    key: "readTemplate",
    value: function readTemplate(theme) {
      return this.readTemplateForTheme(theme) || null;
    }
  }]);

  return ProdComponent;
}(_base_component2.default);

exports.default = ProdComponent;