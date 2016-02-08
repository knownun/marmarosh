"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isArray = require("lodash/isArray");

var _isArray2 = _interopRequireDefault(_isArray);

var _baseBuilder = require("../base-builder");

var _baseBuilder2 = _interopRequireDefault(_baseBuilder);

var _builder = require("./builder");

var _builder2 = _interopRequireDefault(_builder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var local = {
  processedConfig: Symbol("processed"),
  instance: Symbol("instance")
};

var TemplatesBuilder = function (_BaseBuilder) {
  _inherits(TemplatesBuilder, _BaseBuilder);

  function TemplatesBuilder() {
    _classCallCheck(this, TemplatesBuilder);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(TemplatesBuilder).apply(this, arguments));
  }

  _createClass(TemplatesBuilder, [{
    key: "createConfig",
    value: function createConfig() {
      var _this2 = this;

      var config = this.config;

      if (!(0, _isArray2.default)(config.resources)) {
        config.resources = [config.resources];
      }

      return config.resources.map(function (resource) {
        return _this2.createChildConfig(resource);
      });
    }
  }, {
    key: "createChildConfig",
    value: function createChildConfig(resource) {
      var _this3 = this;

      var root = this.config.src;

      var src = resource.src;
      var dest = resource.dest;

      var debug = !this.isProduction;
      var bail = !!debug;
      var serverReplace = resource.getConfig().serverReplaceVars;
      var themes = resource.getConfig().themes;

      return {
        root: root,
        src: src,
        dest: dest,
        debug: debug,
        themes: themes,
        serverReplace: serverReplace,
        events: {
          done: function done(_ref) {
            var percentage = _ref.percentage;
            var msg = _ref.msg;

            _this3.emit("build.waiting", { key: resource.getKey(), percentage: percentage, msg: msg });
          },
          end: function end(_ref2) {
            var files = _ref2.files;

            _this3.emit("build.end", { key: resource.getKey(), files: files });
          },
          error: function error(_ref3) {
            var message = _ref3.message;

            _this3.emit("build.error", { key: resource.getKey(), message: message });
          }
        }
      };
    }
  }, {
    key: "createInstance",
    value: function createInstance() {
      var config = this.createConfig();
      return new _builder2.default(config);
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
    key: "getInstance",
    value: function getInstance() {
      if (!this[local.instance]) {
        this[local.instance] = this.createInstance();
      }
      return this[local.instance];
    }
  }, {
    key: "run",
    value: function run(cb) {
      this.getInstance().run(cb);
    }
  }]);

  return TemplatesBuilder;
}(_baseBuilder2.default);

exports.default = TemplatesBuilder;