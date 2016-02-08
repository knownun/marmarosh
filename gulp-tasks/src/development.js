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

      if (this.sintez.isProduction) {
        return this.logger.error("task is available only on Development environment");
      }

      var MarmaroshDevServer = require("marmarosh-dev-server");

      var stylesResources = this.resources.getArray("styles");
      var scriptsResources = this.resources.getArray("script");
      var templateResources = this.resources.getArray("templates");

      var webpackResources = [].concat(stylesResources).concat(scriptsResources);
      var webpackBuilder = this.sintez.getBuilder("webpack", webpackResources);

      var appBuilder = webpackBuilder.getApplicationBuilder();

      var cache = {};

      appBuilder.remove("build.end").remove("build.error").remove("build.waiting").on("build.waiting", function (_ref) {
        var key = _ref.key;

        if (!cache[key]) {
          cache[key] = true;
          _this2.logger.log("#0 %" + key + "% build was started");
        }
      }).on("build.end", function (params) {
        var message = "#" + params.counter + " %" + params.key + "% was packed. Elapsed time %" + params.time + "s%. Number of files %" + params.scripts.length + "%";
        appBuilder.remove("build.waiting");

        _this2.logger.log(message);
      }).on("build.error", function (_ref2) {
        var key = _ref2.key;
        var errors = _ref2.errors;
        var extendedFormat = _ref2.extendedFormat;

        appBuilder.remove("build.waiting");
        var message = _this2.getErrorMessage({ key: key, errors: errors, extendedFormat: extendedFormat });
        _this2.logger.error(message);
      });

      var server = this.sintez.getServer(MarmaroshDevServer, {
        templates: templateResources,
        styles: stylesResources,
        scripts: scriptsResources,
        webpack: webpackBuilder
      });

      server.run(function () {});
    }
  }, {
    key: "name",
    get: function get() {
      return "dev";
    }
  }]);

  return _class;
}(_baseTask2.default);

exports.default = _class;