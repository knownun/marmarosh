"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _url = require("url");

var _path = require("path");

var _glob = require("glob");

var _isArray = require("lodash/isArray");

var _isArray2 = _interopRequireDefault(_isArray);

var _uniq = require("lodash/uniq");

var _uniq2 = _interopRequireDefault(_uniq);

var _baseResource = require("./base-resource");

var _baseResource2 = _interopRequireDefault(_baseResource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var JsResoruce = function (_BaseResource) {
  _inherits(JsResoruce, _BaseResource);

  function JsResoruce() {
    _classCallCheck(this, JsResoruce);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(JsResoruce).apply(this, arguments));
  }

  _createClass(JsResoruce, [{
    key: "getSrc",
    value: function getSrc() {
      var relativeSrc = this.getRelativeSrc();
      var src = this.getProjectSrc();
      var resourceSrc = (0, _isArray2.default)(relativeSrc) ? relativeSrc : [relativeSrc];
      var output = [];

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = resourceSrc[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var path = _step.value;

          var collected = JsResoruce.collectScripts(src, path);
          output = output.concat(collected);
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

      return (0, _uniq2.default)(output);
    }
  }, {
    key: "getUrl",
    value: function getUrl() {
      var url = _get(Object.getPrototypeOf(JsResoruce.prototype), "getUrl", this).call(this);
      var split = this.getOptions("split");
      var output = [];

      if (split) {
        var target = this.getRelativeTarget();
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = Object.keys(split)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var name = _step2.value;

            output.push((0, _url.resolve)("/", target, name + ".js"));
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

      output.push(url);

      return output;
    }
  }, {
    key: "extensions",
    get: function get() {
      return this.getConfig().extensions || [".js"];
    }
  }], [{
    key: "collectScripts",
    value: function collectScripts(src, paths) {
      paths = (0, _isArray2.default)(paths) ? paths : [paths];
      var scripts = [];

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = paths[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var path = _step3.value;

          var modulePath = (0, _path.join)(src, path);
          var collected = (0, _glob.sync)(modulePath, { nosort: true });
          if (collected.length) {
            var processedScripts = collected.map(function (script) {
              return "./" + script;
            });
            scripts = scripts.concat(processedScripts);
          } else {
            scripts.push(path); // Workaround for dev. step when using npm link this package
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      return scripts;
    }
  }]);

  return JsResoruce;
}(_baseResource2.default);

exports.default = JsResoruce;