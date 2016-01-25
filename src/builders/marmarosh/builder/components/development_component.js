import lo from 'lodash'

import Base from './base_component'

var local = {
  conditions: Symbol('template_conditions')
};

export default class DevComponent extends Base {

  constructor(config, overrideConfigObj, childInstance) {
    super(config, overrideConfigObj, childInstance);
    if (this.hasIndexJS) {
      var componentConfig = this.getConfig();
      var scriptOpt = this.getPropsFrom(componentConfig.script_options, 'default') || {};
      this.addJSOptions(this, this.getName(), scriptOpt);
    }
  }

  includeSet(name, widgetArrayName, template) {
    var out = '', template = template || '{body}';
    var theme = this.getTheme();
    var over = {};
    var i = 1;
    lo.set(over, "route.theme", this.getTheme());
    var widgetsObj = this.getConfig(widgetArrayName);
    if (lo.isObject(Array)) {
      lo.forOwn(widgetsObj, (options)=> {
        var instance = new this.constructor(name, over);
        instance.updateConfig(options);
        instance.setTheme(theme);
        instance.__repeaterIndex = i;
        out += instance.getHTML();
        i++;
      });
      out = out.length > 0 ? template.replace('{body}', out) : out;
    }
    return out;
  }

  include(path, newName) {
    var theme = this.getTheme();
    var over = {};
    lo.set(over, "route.theme", this.getTheme());
    var component = new this.constructor(path, over);
    var name = newName || component.getName();
    var extendOptions = this.getConfig(`widgets.${name}`);

    lo.isObject(extendOptions) && component.updateConfig(extendOptions);
    lo.isString(theme) && component.setTheme(theme);
    lo.isString(newName) && component.setPlace(newName);

    if (component.hasIndexJS) {
      var componentConfig = component.getConfig();
      var scriptOpt = this.getPropsFrom(componentConfig.script_options, 'default') || {};
      this.addJSOptions(component, newName || component.getName(), scriptOpt);
    }

    return component.getHTML();
  }

  getInstance(over) {
    var ins = this;
    var prop = 'layout';
    var config = ins.getConfig();

    over = lo.merge(over, {
      template_options: this.getConfig("layout_options")
    });

    if (lo.has(config, prop)) {
      lo.set(over, "route.theme", this.getTheme());
      ins = new this.constructor(lo.get(config, prop), over, this);
      ins.setTheme(this.getTheme());
      if (this._JSOptions) {
        ins.addJSOptions(this, this._JSOptions);
      }
    }

    return ins;
  }

  initTemplateLocals() {
    super.initTemplateLocals();
    this.setTemplateLocal("dev", true);
  }

  IF(left, operand, right) {
    var result;
    var leftStr = parseSelector.bind(this)(left);
    if (arguments.length === 3) {
      var rightStr = parseSelector.bind(this)(right);
      operand = operand || '!=';
    }
    result = (operand && right) ? !!eval(`${leftStr}${operand}${rightStr}`) : !!eval(`${leftStr}`) || null;
    this[local.conditions] = this[local.conditions] || [];
    this[local.conditions].push(result);
    return result ? '' : '<div style="display:none">'
  }

  IF_NOT(left, operand, right) {
    var result;
    var leftStr = parseSelector.bind(this)(left);
    if (arguments.length === 3) {
      var rightStr = parseSelector.bind(this)(right);
      operand = operand || '!=';
    }
    result = (operand && right) ? !!eval(`${leftStr}${operand}${rightStr}`) : !!eval(`${leftStr}`) || null;
    result = !result;
    this[local.conditions] = this[local.conditions] || [];
    this[local.conditions].push(result);
    return result ? '' : '<div style="display:none">'
  }

  ENDIF() {
    var option = this[local.conditions].pop();
    return option ? '' : '</div>'
  }

  itemIndex() {
    return this.__repeaterIndex || 1;
  }

}

function parseSelector(selector) {
  var out = selector || undefined;
  if (selector && selector.split && selector.split('.').length == 2) {
    switch (selector.split('.')[0]) {
      case 'strings':
      case 'links':
      case 'images':
      case 'template_options':
        out = lo.get(this.getClientConfig(), selector);
        break;
    }
  }
  return JSON.stringify(out)
}
