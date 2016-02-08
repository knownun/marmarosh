'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _values = require('lodash/values');

var _values2 = _interopRequireDefault(_values);

var _helpers = require('../../../utils/helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SplitByPathPlugin = function () {
  function SplitByPathPlugin(options) {
    _classCallCheck(this, SplitByPathPlugin);

    this.buckets = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = options[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var bucket = _step.value;

        var paths = null;
        if ((0, _isArray2.default)(bucket.path)) {
          paths = bucket.path;
        } else {
          paths = [bucket.path];
        }

        this.buckets.push({
          name: bucket.name,
          path: paths.map(function (p) {
            return new RegExp(p.replace(/\//g, _helpers.sep));
          })
        });
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
  }

  _createClass(SplitByPathPlugin, [{
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      var match = function match(chunk) {
        var match = null;
        _this.buckets.some(function (bucket) {
          return bucket.filePath.some(function (path) {
            if (filePath.test(chunk.userRequest)) {
              match = bucket;
              return true;
            }
          });
        });

        return match;
      };

      compiler.plugin('compilation', function (compilation) {
        var splitedChunks = {};

        compilation.plugin('optimize-chunks', function (chunks) {
          var filtered = chunks.slice().filter(function (chunk) {
            return chunk.entry;
          });

          var waitForRemove = [];

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = filtered[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var chunk = _step2.value;
              var _iteratorNormalCompletion3 = true;
              var _didIteratorError3 = false;
              var _iteratorError3 = undefined;

              try {
                for (var _iterator3 = chunk.modules[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                  var mod = _step3.value;

                  var bucket = match(mod);
                  if (bucket) {
                    var newChunk = splitedChunks[bucket.name];
                    if (!newChunk) {
                      newChunk = this.addChunk(bucket.name);
                      //newChunk.parents = [chunk];
                      splitedChunks[bucket.name] = newChunk;
                    }

                    // add the module to the new chunk
                    newChunk.addModule(mod);
                    mod.addChunk(newChunk);

                    // remove it from the existing chunk
                    waitForRemove.push(mod);
                  } else {
                    //console.log('original', mod.userRequest);
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

              var _iteratorNormalCompletion4 = true;
              var _didIteratorError4 = false;
              var _iteratorError4 = undefined;

              try {
                for (var _iterator4 = waitForRemove[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                  var removeMod = _step4.value;

                  chunk.removeModule(removeMod);
                  removeMod.removeChunk(chunk);
                }

                //chunk.entry = chunk.initial = true;

                /**
                 *
                 * Entry chunk
                 * An entry chunk contains the runtime plus a bunch of modules.
                 * If the chunk contains the module 0 the runtime executes it.
                 * If not, it waits for chunks that contains the module 0 and executes it (every time when there is a chunk
                 * with a module 0).
                 *
                 * Normal chunk
                 * A normal chunk contains no runtime.
                 * It only contains a bunch of modules.
                 * The structure depends on the chunk loading algorithm.
                 * I. e. for jsonp the modules are wrapped in a jsonp callback function. The chunk also contains a list of
                 * chunk id that it fulfills.
                 *
                 * Initial chunk (non-entry)
                 * An initial chunk is a normal chunk.
                 * The only difference is that optimization treats it as more important because it counts toward the initial
                 * loading time (like entry chunks). That chunk type can occur in combination with the CommonsChunkPlugin.
                 */
              } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion4 && _iterator4.return) {
                    _iterator4.return();
                  }
                } finally {
                  if (_didIteratorError4) {
                    throw _iteratorError4;
                  }
                }
              }

              var all = (0, _values2.default)(splitedChunks);
              all.push(chunk);

              var main = all.shift();
              //var main = chunk;

              main.entry = true;
              main.initial = true;
              main.chunks = all;

              var _iteratorNormalCompletion5 = true;
              var _didIteratorError5 = false;
              var _iteratorError5 = undefined;

              try {
                for (var _iterator5 = all[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                  var resultChunk = _step5.value;

                  //get the first chunk as a parent
                  resultChunk.parents = [main];
                  resultChunk.entry = false;
                  resultChunk.initial = false;
                }
              } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion5 && _iterator5.return) {
                    _iterator5.return();
                  }
                } finally {
                  if (_didIteratorError5) {
                    throw _iteratorError5;
                  }
                }
              }
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
        }, _this);
      });
    }
  }]);

  return SplitByPathPlugin;
}();

exports.default = SplitByPathPlugin;