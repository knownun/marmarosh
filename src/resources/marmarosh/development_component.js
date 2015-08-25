import lo from 'lodash'

import Base from './base_component'

export default class DevComponent extends Base {

  constructor(config, overrideConfigObj, childInstance) {
    super(config, overrideConfigObj, childInstance);
  }

  include(path, newName) {
    var component = new this.constructor(path);
    var name = newName || component.getName();
    var extendOptions = this.getConfig(`widgets.${name}`);
    var theme = this.getTheme();

    lo.isObject(extendOptions) && component.updateConfig(extendOptions);
    lo.isString(theme) && component.setTheme(theme);
    lo.isString(newName) && component.setPlace(newName);

    if (component.hasIndexJS) {
      var scriptOpt = lo.get(component.getConfig(), 'script_options') || {};
      this.addJSOptions(path, newName || component.getName(), scriptOpt);
    }

    return component.getHTML();
  }

  getInstance(over) {
    var ins = this;
    var prop = 'layout';
    var config = ins.getConfig();

    if (lo.has(config, prop)) {
      ins = new this.constructor(lo.get(config, prop), over, this);
      ins.setTheme(this.getTheme());
      if (this._JSOptions) {
        ins.addJSOptions(this._JSOptions);
      }
    }

    return ins;
  }

}
