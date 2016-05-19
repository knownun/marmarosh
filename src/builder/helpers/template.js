import isString from "lodash/isString";
import getter from "lodash/get";

let local = {
  builderConfig: Symbol("builderConfig"),
  serverConfig: Symbol("serverConfig")
};

export default (builderConfig) => class Helpers {
  constructor(config) {
    this[local.builderConfig] = builderConfig;
    this[local.serverConfig] = config;
  }

  getServerConfig() {
    return this[local.builderConfig];
  }

  getConfig(path) {
    let cfg = this[local.builderConfig];
    return path ? getter(cfg, path) : cfg;
  }

  includeBody() {
    return "\n" + this.getConfig("serverReplace.includeBody") + "\n";
  }

  getString(name) {
    var placeholder = getter(this.getServerConfig(), `strings.${name}`);
    var template = this.getConfig("serverReplace.getString");
    return placeholder || isString(template) ? template.replace("${name}", name) : "";
  }

  getLink(name) {
    var placeholder = getter(this.getServerConfig(), `links.${name}`);
    var template = this.getConfig("serverReplace.getLink");
    return placeholder || isString(template) ? template.replace("${name}", name) : "";
  }

  getImageURL(name) {
    var placeholder = getter(this.getServerConfig(), `images.${name}`);
    var template = this.getConfig("serverReplace.getImageURL");
    return placeholder || isString(template) ? template.replace("${name}", name) : "";
  }

  getOption(name) {
    var placeholder = getter(this.getServerConfig(), `template_options.${name}`);
    var template = this.getConfig("serverReplace.getOption");
    return placeholder || isString(template) ? template.replace("${name}", name) : "";
  }

  includeMeta() {
    return "\n" + this.getConfig("serverReplace.includeMeta") + "\n";
  }

  getHtmlClass() {
    return this.getConfig("serverReplace.getHtmlClass");
  }

  includeCSS() {
    return "\n" + this.getConfig("serverReplace.includeCSS") + "\n";
  }

  includeJS() {
    return "\n" + this.getConfig("serverReplace.includeJS") + "\n";
  }

  includeJSOptions() {
    return "\n" + this.getConfig("serverReplace.includeJSOptions") + "\n";
  }

  if(left, operand = "!=", right = "null") {
    var leftStr = parseSelector.bind(this)(left);
    var rightStr = parseSelector.bind(this)(right);
    return "\n" + `@if(${leftStr} ${operand} ${rightStr})` + "{\n";
  }

  ifnot(left, operand = "!=", right = "null") {
    var leftStr = parseSelector.bind(this)(left);
    var rightStr = parseSelector.bind(this)(right);
    return "\n" + `@if(!(${leftStr} ${operand} ${rightStr}))` + "{\n";
  }

  endif() {
    return "\n}\n";
  }

  itemIndex() {
    return "@ViewBag.index";
  }

  includeServerHelper(helper, ...args) {
    return helper.replace(/\$\d/gm, (str)=> {
      return args[str.substr(1) - 1] || "null";
    });
  }
};

function parseSelector(selector) {
  var out = selector || "null";
  if (selector && selector.split && selector.split(".").length == 2) {
    switch (selector.split(".")[0]) {
      case "strings":
        out = this.getString(selector.split(".")[1]);
        break;
      case "links":
        out = this.getLink(selector.split(".")[1]);
        break;
      case "images":
        out = this.getImageURL(selector.split(".")[1]);
        break;
      case "layout_options":
      case "template_options":
        out = this.getOption(selector.split(".")[1]);
        break;
    }
  }
  return out;
}
