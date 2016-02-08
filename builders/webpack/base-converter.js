'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseConverter = function () {
  function BaseConverter(src, dest) {
    _classCallCheck(this, BaseConverter);

    this.src = src;
    this.dest = dest;
  }

  _createClass(BaseConverter, [{
    key: 'convert',
    value: function convert() {
      throw new Error('@convert method should be implemented');
    }
  }]);

  return BaseConverter;
}();

exports.default = BaseConverter;