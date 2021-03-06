"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  name: "scripts",
  loaders: {
    babel: ["\.(js|jsx|es|es6)$"],
    yaml: ["\.(yml|yaml)$"],
    html: ["\.(htm|html)$"],
    json: ["\.json$"],
    jade: ["\.jade$"]
  }
};