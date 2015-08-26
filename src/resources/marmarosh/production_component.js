import fs from 'fs';
import yaml from 'js-yaml';
import lo from 'lodash';

import path from 'path';

import Base from './base_component';

export default class ProdComponent extends Base {

  constructor(config, overrideConfigObj) {
    super(config, overrideConfigObj);
  }

  include(componentPath, widgetName) {
    var typeName = path.basename(componentPath);
    var name = widgetName || typeName;
    this.widgets = this.widgets || {};
    this.widgets[name] = {
      'default': typeName
    };
    var template = this.getConfig("builder.serverReplace.include");
    var placeholder = lo.get(this.getServerConfig(), `widgets.${name}`);
    return (placeholder || (lo.isString(template) ? template.replace('${name}', name) : `@Widget("${name}")`)) + '\n';
  }

  includeBody() {
    var template = this.getConfig("builder.serverReplace.includeBody");
    return (lo.isString(template) ? template : '@Body()') + '\n'
  }

  getString(name) {
    var placeholder = lo.get(this.getServerConfig(), `strings.${name}`);
    var template = this.getConfig("builder.serverReplace.getString");
    return placeholder || lo.isString(template) ? template.replace('${name}', name) : `@ViewBag.strings.${name}`
  }

  getLink(name) {
    var placeholder = lo.get(this.getServerConfig(), `links.${name}`);
    var template = this.getConfig("builder.serverReplace.getLink");
    return placeholder || lo.isString(template) ? template.replace('${name}', name) : `@ViewBag.urls.${name}`
  }

  getOption(name) {
    var placeholder = lo.get(this.getServerConfig(), `template_options.${name}`);
    var template = this.getConfig("builder.serverReplace.getOption");
    return placeholder || lo.isString(template) ? template.replace('${name}', name) : `@ViewBag.template.${name}`
  }

  includeCSS() {
    var template = this.getConfig("builder.serverReplace.includeCSS");
    return (lo.isString(template) ? template : '@CssReferences()') + '\n'
  }

  includeJS() {
    var template = this.getConfig("builder.serverReplace.includeJS");
    return (lo.isString(template) ? template : '@ScriptsReferences()') + '\n'
  }

  includeJSOptions() {
    var template = this.getConfig("builder.serverReplace.includeJSOptions");
    return (lo.isString(template) ? template : '@ServerConfigurations()') + '\n'
  }

  renderString(prod, dev) {
    return prod || ''
  }

  initTemplateLocals() {
    super.initTemplateLocals();
    this.setTemplateLocal("dev", false);
  }

  getServerConfig() {
    var config = this.getConfig();
    return {
      template_options: this.getPropsFrom(config.template_options, 'placeholder'),
      script_options: this.getPropsFrom(config.script_options, 'placeholder'),
      widgets: this.getPropsFrom(config.widgets, 'placeholder'),
      strings: this.getPropsFrom(config.strings, 'placeholder'),
      links: this.getPropsFrom(config.links, 'placeholder')
    };
  }

  //getHTML(theme) {
  //var RX = /(\/\/|<!--) RAZOR >> (.*) << \/\/(-->)?/gm;
  //var html = super.getHTML(theme);
  //if (lo.isString(html)) {
  //html = html.replace(RX, '$2');
  //}
  //return html;
  //}

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

  includeSet(componentPath, models, template) {
    var name = path.basename(componentPath), template = template || null;
    this.widgetsSets = this.widgetsSets || {};
    lo.set(this.widgetsSets, name, true);
    return '\n' + `@RepeatWidget("${componentPath}", ${models}, ${template})` + '\n';
  }
}
