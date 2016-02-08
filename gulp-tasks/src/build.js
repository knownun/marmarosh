"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _gulpUtil = require("gulp-util");

var _gulpUtil2 = _interopRequireDefault(_gulpUtil);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _async = require("async");

var _async2 = _interopRequireDefault(_async);

var _baseTask = require("../base-task");

var _baseTask2 = _interopRequireDefault(_baseTask);

var _styles = require("./styles");

var _styles2 = _interopRequireDefault(_styles);

var _javascript = require("./javascript");

var _javascript2 = _interopRequireDefault(_javascript);

var _templates = require("./templates");

var _templates2 = _interopRequireDefault(_templates);

var _clean = require("./clean");

var _clean2 = _interopRequireDefault(_clean);

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

      this.styles = new _styles2.default(this.gulp, this.sintez);
      this.scipts = new _javascript2.default(this.gulp, this.sintez);
      this.templates = new _templates2.default(this.gulp, this.sintez);

      this.clean = new _clean2.default(this.gulp, this.sintez);

      this.clean.run(function (err) {
        if (err) throw new Error("Error in clean task");

        _async2.default.waterfall([_this2.templates.run.bind(_this2), _this2.styles.run.bind(_this2), _this2.scipts.run.bind(_this2)], function (err) {
          done(err);
        });
      });
    }
  }, {
    key: "name",
    get: function get() {
      return "build";
    }
  }]);

  return _class;
}(_baseTask2.default);

exports.default = _class;