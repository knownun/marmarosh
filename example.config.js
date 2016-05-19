var path = require("path");

module.exports = {
  root: __dirname,
  src: path.resolve("./src") + "/**/config.yml",
  dest: path.resolve("./build/templates"),
  debug: false,
  themes: {
    "main": "main",
    "optional": "?optional"
  },
  serverReplace: {
    helperName: "@include(\"${name}\")"
  }
};
