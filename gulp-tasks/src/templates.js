"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _baseTask = require("../base-task");

var _baseTask2 = _interopRequireDefault(_baseTask);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _class = function (_Base) {
  _inherits(_class, _Base);

  function _class() {
    _classCallCheck(this, _class);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
  }

  _createClass(_class, [{
    key: "run",
    value: function run(done) {
      var _this2 = this;

      var resources = this.resources.getArray("templates");
      var builder = this.sintez.getBuilder("marmarosh-templates", resources);
      var appBuilder = builder.getApplicationBuilder();

      var multi = this.multimeter;
      var bar = {};
      resources.forEach(function (res, i) {
        var key = res.getKey();
        bar[key] = multi.rel(0, i + 1, {
          width: 8,
          solid: { background: null, foreground: 'white', text: '|' },
          empty: { background: null, foreground: null, text: ' ' }
        });
        multi.charm.write("\n");
      });

      appBuilder.remove("build.end").remove("build.error").remove("build.error").on("build.end", function (_ref) {
        var key = _ref.key;
      }).on("build.waiting", function (_ref2) {
        var key = _ref2.key;
        var percentage = _ref2.percentage;
        var msg = _ref2.msg;

        bar[key].percent(Math.round(percentage * 100), "Building " + key + " - " + msg);
      }).on("build.error", function (_ref3) {
        var key = _ref3.key;
        var errors = _ref3.errors;
        var extendedFormat = _ref3.extendedFormat;

        appBuilder.remove("build.waiting");
        var message = _this2.getErrorMessage({ key: key, errors: errors, extendedFormat: extendedFormat });
        _this2.logger.error(message);
      });

      builder.run(function (err) {
        !_this2.multimeterOff && _this2.multimeterEnd();
        done(err);
      });
    }
  }, {
    key: "name",
    get: function get() {
      return "templates";
    }
  }]);

  return _class;
}(_baseTask2.default);

exports.default = _class;