import fs from "fs";
import yaml from "js-yaml";
import lo from "lodash";

import { basename } from "../../../../utils/helpers";

import Base from "./base_component";

export default class ProdComponent extends Base {

  constructor(config, overrideConfigObj) {
    super(config, overrideConfigObj);
  }

  include(componentPath, widgetName) {
    var typeName = basename(componentPath);
    var name = widgetName || typeName;
    this.widgets = this.widgets || {};
    this.widgets[name] = {
      "default": typeName
    };
    var template = this.getConfig("builder.serverReplace.include");
    var placeholder = lo.get(this.getServerConfig(), `widgets.${name}`);
    return (placeholder || (lo.isString(template) ? template.replace("${name}", name) : `@Widget("${name}")`)) + "\n";
  }

  includeBody() {
    var template = this.getConfig("builder.serverReplace.includeBody");
    return (lo.isString(template) ? template : "@Body()") + "\n"
  }

  getString(name) {
    var placeholder = lo.get(this.getServerConfig(), `strings.${name}`);
    var template = this.getConfig("builder.serverReplace.getString");
    return placeholder || lo.isString(template) ? template.replace("${name}", name) : `@ViewBag.strings.${name}`
  }

  getLink(name) {
    var placeholder = lo.get(this.getServerConfig(), `links.${name}`);
    var template = this.getConfig("builder.serverReplace.getLink");
    return placeholder || lo.isString(template) ? template.replace("${name}", name) : `@ViewBag.urls.${name}`
  }

  getImageURL(name) {
    var placeholder = lo.get(this.getServerConfig(), `images.${name}`);
    var template = this.getConfig("builder.serverReplace.getImageURL");
    return placeholder || lo.isString(template) ? template.replace("${name}", name) : `@ViewBag.images.${name}`
  }

  getOption(name) {
    var placeholder = lo.get(this.getServerConfig(), `template_options.${name}`);
    var template = this.getConfig("builder.serverReplace.getOption");
    return placeholder || lo.isString(template) ? template.replace("${name}", name) : `@ViewBag.template.${name}`
  }

  includeMeta() {
    var template = this.getConfig("builder.serverReplace.includeMeta");
    return (lo.isString(template) ? template : "@Meta()") + "\n"
  }

  getHtmlClass() {
    var template = this.getConfig("builder.serverReplace.getHtmlClass");
    return (lo.isString(template) ? template : "@getHtmlClass()")
  }

  includeCSS() {
    var template = this.getConfig("builder.serverReplace.includeCSS");
    return (lo.isString(template) ? template : "@CssReferences()") + "\n"
  }

  includeJS() {
    var template = this.getConfig("builder.serverReplace.includeJS");
    return (lo.isString(template) ? template : "@ScriptsReferences()") + "\n"
  }

  includeJSOptions() {
    var template = this.getConfig("builder.serverReplace.includeJSOptions");
    return (lo.isString(template) ? template : "@ServerConfigurations()") + "\n"
  }

  IF(left, operand = "!=", right = "null") {
    var leftStr = parseSelector.bind(this)(left);
    var rightStr = parseSelector.bind(this)(right);
    return "\n" + `@if(${leftStr} ${operand} ${rightStr})` + "{\n"
  }

  IF_NOT(left, operand = "!=", right = "null") {
    var leftStr = parseSelector.bind(this)(left);
    var rightStr = parseSelector.bind(this)(right);
    return "\n" + `@if(!(${leftStr} ${operand} ${rightStr}))` + "{\n"
  }

  ENDIF() {
    return "\n}\n"
  }

  renderString(prod, dev) {
    return prod || ""
  }

  initTemplateLocals() {
    super.initTemplateLocals();
    this.setTemplateLocal("dev", false);
  }

  getServerConfig() {
    var config = this.getConfig();
    return {
      template_options: this.getPropsFrom(config.template_options, "placeholder"),
      layout_options: this.getPropsFrom(config.layout_options, "placeholder"),
      script_options: this.getPropsFrom(config.script_options, "placeholder"),
      widgets: this.getPropsFrom(config.widgets, "placeholder"),
      strings: this.getPropsFrom(config.strings, "placeholder"),
      images: this.getPropsFrom(config.images, "placeholder"),
      links: this.getPropsFrom(config.links, "placeholder")
    };
  }

  getPropsFrom(input, propertyPath) {
    var output = {};
    if (lo.isObject(input)) {
      lo.forOwn(input, (value, key) => {
        if (!lo.startsWith(key, "$")) {
          output[key] = (lo.isObject(value) && propertyPath) ? lo.get(value, propertyPath) : value;
        }
      });
    }
    return output;
  }

  readTemplate(theme) {
    return this.readTemplateForTheme(theme, this.getName()) || null;
  }

  getTemplate(theme) {
    var html = null;
    this.templateFn = this.readTemplate(theme);
    if (lo.isFunction(this.templateFn)) {
      html = this.templateFn(this.getTemplateLocals());
    }
    return html;
  }

  includeSet(componentPath, models) {
    var name = basename(componentPath);
    this.widgets = this.widgets || {};
    lo.set(this.widgets, name, {"default": name});
    return "\n" + `@RepeatWidget("${name}", ${models})` + "\n";
  }

  itemIndex() {
    return "@ViewBag.index"
  }
}

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
  return out
}
