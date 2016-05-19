import lo from "lodash";

import {basename} from "../../utils";

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
}
