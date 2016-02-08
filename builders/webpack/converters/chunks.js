'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');

var _CommonsChunkPlugin2 = _interopRequireDefault(_CommonsChunkPlugin);

var _baseConverter = require('../base-converter');

var _baseConverter2 = _interopRequireDefault(_baseConverter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Chunks = function (_BaseConverter) {
  _inherits(Chunks, _BaseConverter);

  function Chunks() {
    _classCallCheck(this, Chunks);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Chunks).apply(this, arguments));
  }

  _createClass(Chunks, [{
    key: 'getConfig',
    value: function getConfig(entries, output) {
      var chunkPlugin = null;

      if (!output) {
        var list = Object.keys(entries).slice(0, -1).reverse();

        chunkPlugin = new _CommonsChunkPlugin2.default({
          name: list,
          minChunks: Infinity
        });
      }

      return chunkPlugin;
    }
  }]);

  return Chunks;
}(_baseConverter2.default);

exports.default = Chunks;