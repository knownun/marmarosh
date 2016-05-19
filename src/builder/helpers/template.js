import isString from "lodash/isString";
import getter from "lodash/get";
import setter from "lodash/get";

import {basename} from "../../utils";

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

  get helpersList() {
    return this.registered;
  }

  includeBody() {
    var template = this.getConfig("builder.serverReplace.includeBody");
    return (isString(template) ? template : "@Body()") + "\n";
  }

  getString(name) {
    var placeholder = getter(this.getServerConfig(), `strings.${name}`);
    var template = this.getConfig("builder.serverReplace.getString");
    return placeholder || isString(template) ? template.replace("${name}", name) : `@ViewBag.strings.${name}`;
  }

  getLink(name) {
    var placeholder = getter(this.getServerConfig(), `links.${name}`);
    var template = this.getConfig("builder.serverReplace.getLink");
    return placeholder || isString(template) ? template.replace("${name}", name) : `@ViewBag.urls.${name}`;
  }

  getImageURL(name) {
    var placeholder = getter(this.getServerConfig(), `images.${name}`);
    var template = this.getConfig("builder.serverReplace.getImageURL");
    return placeholder || isString(template) ? template.replace("${name}", name) : `@ViewBag.images.${name}`;
  }

  getOption(name) {
    var placeholder = getter(this.getServerConfig(), `template_options.${name}`);
    var template = this.getConfig("builder.serverReplace.getOption");
    return placeholder || isString(template) ? template.replace("${name}", name) : `@ViewBag.template.${name}`;
  }

  includeMeta() {
    var template = this.getConfig("builder.serverReplace.includeMeta");
    return (isString(template) ? template : "@Meta()") + "\n";
  }

  getHtmlClass() {
    var template = this.getConfig("builder.serverReplace.getHtmlClass");
    return (isString(template) ? template : "@getHtmlClass()");
  }

  includeCSS() {
    var template = this.getConfig("builder.serverReplace.includeCSS");
    return (isString(template) ? template : "@CssReferences()") + "\n";
  }

  includeJS() {
    var template = this.getConfig("builder.serverReplace.includeJS");
    return (isString(template) ? template : "@ScriptsReferences()") + "\n";
  }

  includeJSOptions() {
    var template = this.getConfig("builder.serverReplace.includeJSOptions");
    return (isString(template) ? template : "@ServerConfigurations()") + "\n";
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

  includeSet(componentPath, models) {
    var name = basename(componentPath);
    this.widgets = this.widgets || {};
    setter(this.widgets, name, {"default": name});
    return "\n" + `@RepeatWidget("${name}", ${models})` + "\n";
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
