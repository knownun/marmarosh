import fs from 'fs'
import jade from 'jade'
import yaml from 'js-yaml'
import {sync as globSync} from 'glob'

import { log } from 'gulp-util'
import lo from 'lodash'

import path from 'path'

var local = {
  src: Symbol('src'),
  name: Symbol('name'),
  type: Symbol('type'),
  place: Symbol('place'),
  theme: Symbol('theme'),
  config: Symbol('config'),
  configPath: Symbol('configPath'),
  clientConfig: Symbol('clientConfig'),
  bodyInstance: Symbol('bodyInstance'),
  templateLocals: Symbol('templateLocals')
};

export default class Base {
  constructor(config, overrideConfigObj, childInstance) {
    this.saveConfig(config, overrideConfigObj);
    if (overrideConfigObj) this.updateConfig(overrideConfigObj);
    if (childInstance) this.setBodyInstance(childInstance);
    this.initTemplateLocals();
  }

  isValidConfig(input) {
    var output = false;
    if (
      lo.has(input, "name") &&
      lo.has(input, "src") &&
      lo.has(input, "config") &&
      lo.has(input, "configPath")
    ) {
      output = true;
    }
    return output;
  }

  updateConfig(sources) {
    if (sources) {
      var config = this.getConfig();
      config = this.merge(config, sources);
      this.setConfig(config);
      this.setTheme(lo.get(config, 'route.theme'));
    }
    return this;
  }

  saveConfig(configPath, overrideObj) {
    var data = this.readConfig(configPath, overrideObj);
    if (this.isValidConfig(data)) {
      this[local.src] = data.src;
      this[local.name] = data.name;
      this[local.type] = data.type;
      this[local.config] = data.config;
      this[local.configPath] = data.configPath;
    } else {
      throw new Error("@readConfig method should be return { name, src, config, configPath}");
    }

  }

  merge(input, sources) {
    var output = lo.cloneDeep(input);
    return lo.merge(output, sources);
  }

  getConfig(path) {
    var cfg = this[local.config];
    return path ? lo.get(cfg, path) : cfg
  }

  setConfig(obj) {
    this[local.config] = obj
  }

  getName() {
    return this[local.name]
  }

  getType() {
    return this[local.type]
  }

  getConfigPath() {
    return this[local.configPath]
  }

  getSrc() {
    return this[local.src]
  }

  readTemplate(theme) {
    return this.readTemplateForTheme(theme) || this.readTemplateForTheme('main') || null;
  }

  readTemplateForTheme(theme, name) {
    var compilerFn = jade.compileFile;
    var compileOptions = {
      pretty: true,
      self: true
    };
    var filePath = this.getTemplatePathForTheme(theme);
    return filePath ? compilerFn(filePath, compileOptions) : null;
  }

  get hasIndexJS() {
    var filePath = path.resolve(path.join(this.getSrc(), 'index.js'));
    var jsxFilePath = path.resolve(path.join(this.getSrc(), 'index.jsx'));
    return fs.existsSync(filePath) || fs.existsSync(jsxFilePath);
  }

  getTemplatePathForTheme(theme) {
    var mask = path.resolve(path.join(this.getSrc(), '**', theme + '.jade'));
    var files = globSync(mask);
    return (files.length) ? files[0] : null;
  }

  hasTemplateForTheme(theme) {
    return this.getTemplatePathForTheme(theme) ? true : false;
  }

  getConfigPathForTheme(theme) {
    var mask = path.resolve(path.join(this.getSrc(), '**', theme + '.yml'));
    var files = globSync(mask);
    return (files.length) ? files[0] : null;
  }

  hasConfigForTheme(theme) {
    return this.getConfigPathForTheme(theme) ? true : false;
  }

  getTemplate(theme) {
    var html = '';
    if (!this.templateFn) {
      this.templateFn = this.readTemplate(theme);
    }
    if (lo.isFunction(this.templateFn)) {
      html = this.templateFn(this.getTemplateLocals());
    }
    return html;
  }

  getTemplateLocals(path) {
    return lo.isUndefined(path) ? this[local.templateLocals] : lo.get(this[local.templateLocals], path)
  }

  setTemplateLocal(path, obj) {
    if (!this[local.templateLocals]) this[local.templateLocals] = {};
    lo.set(this[local.templateLocals], path, obj);
  }

  renderString(prod, dev) {
    return dev || ''
  }

  initTemplateLocals() {
    this.setTemplateLocal("include", this.include.bind(this));
    this.setTemplateLocal("getString", this.getString.bind(this));
    this.setTemplateLocal("getOption", this.getOption.bind(this));
    this.setTemplateLocal("getLink", this.getLink.bind(this));
    this.setTemplateLocal("getImageURL", this.getImageURL.bind(this));

    this.setTemplateLocal("includeBody", this.includeBody.bind(this));

    // for layout
    this.setTemplateLocal('includeMeta', this.includeMeta.bind(this));
    this.setTemplateLocal('includeCSS', this.includeCSS.bind(this));
    this.setTemplateLocal('includeJS', this.includeJS.bind(this));
    this.setTemplateLocal('includeJSOptions', this.includeJSOptions.bind(this));
    this.setTemplateLocal('getHtmlClass', this.getHtmlClass.bind(this));

    this.setTemplateLocal("render", this.renderString.bind(this));

    this.setTemplateLocal("includeSet", this.includeSet.bind(this));
    this.setTemplateLocal("if", this.IF.bind(this));
    this.setTemplateLocal("ifnot", this.IF_NOT.bind(this));
    this.setTemplateLocal("endif", this.ENDIF.bind(this));

  }

  getHtmlClass() {
    return ""
  }

  include() {
    throw new Error("@include method should be implemented")
  }

  setBodyInstance(childInstance) {
    this[local.bodyInstance] = {
      instance: childInstance,
      html: childInstance.getHTML()
    };
    if (childInstance._JSOptions) {
      this.addJSOptions(childInstance, childInstance._JSOptions);
    }
  }

  getBodyInstance() {
    return this[local.bodyInstance];
  }

  getTheme() {
    return this[local.theme]
  }

  setTheme(value) {
    if (lo.isString(value)) this[local.theme] = value
  }

  get serverConfigurations() {
    var obj = this.getConfig('route.serverConfigurations');
    return lo.merge(obj, {"components": this._JSOptions})
  }

  addJSOptions(instance, name, options) {
    this._JSOptions = this._JSOptions || [];
    if (arguments.length == 2 && lo.isArray(name)) {
      this._JSOptions = lo.union(this._JSOptions, name);
    } else {
      var type = instance.getName();
      var component_type = instance.getType();
      var model = {};
      if (lo.startsWith(type, 'react')) {
        component_type = "react-" + component_type;
        model = lo.pick(instance.getClientConfig(), "template_options", "strings", "images", "links");
      }
      this._JSOptions.push({name, type, component_type, options, model});
    }
  }

  parseAttributes(obj, type = 'attr') {
    var output = '';
    if (lo.isString(obj)) {
      output = obj
    } else if (lo.isObject(obj)) {
      lo.forOwn(obj, (value, key) => {
        if (lo.isString(value) || lo.isNumber(value)) {
          if (type == 'attr') {
            output += ` ${key}='${value}'`;
          } else if (type == 'props') {
            output += `${key}:${value};`;
          }
        } else if (lo.isObject(value)) {
          output += this.parseAttributes(value, 'props');
        }
      });
    }
    return output
  }

  setPlace(value) {
    this[local.place] = value;
  }

  getPlace() {
    return this[local.place];
  }

  includeBody() {
    var ins = this.getBodyInstance();
    return (ins && ins.html) ? ins.html : '$BODY$';
  }

  getString(name) {
    var config = this.getClientConfig();
    return lo.get(config, `strings.${name}`)
  }

  getLink(name) {
    var config = this.getClientConfig();
    return lo.get(config, `links.${name}`)
  }

  getImageURL(name) {
    var config = this.getClientConfig();
    return lo.get(config, `images.${name}`)
  }

  getOption(name) {
    var config = this.getClientConfig();
    return lo.get(config, `template_options.${name}`)
  }

  getHTML(theme) {
    return this.getTemplate(theme || this.getTheme());
  }

  getClientConfig() {
    var config = this.getConfig();
    var cache = this[local.clientConfig];

    if (!cache) {
      cache = {
        template_options: this.getPropsFrom(config.template_options, 'default'),
        script_options: this.getPropsFrom(config.script_options, 'default'),
        strings: this.getPropsFrom(config.strings, 'default'),
        images: this.getPropsFrom(config.images, 'default'),
        links: this.getPropsFrom(config.links, 'default')
      }
    }
    return cache;
  }

  getPropsFrom(input, propertyPath) {
    var output = {};
    if (lo.isObject(input)) {
      lo.forOwn(input, (value, key) => {
        key = lo.startsWith(key, '$') ? key.substr(1) : key;
        output[key] = (lo.isObject(value) && propertyPath) ? lo.get(value, propertyPath) : value;
      });
    }
    return output;
  }

  includeCSS() {
    var out = '';
    var themes = this.getConfig("route.themes");
    var activeTheme = this.getConfig("route.theme");

    themes.forEach((theme)=> {
      if (lo.startsWith(theme, '?')) {
        var name = theme.substr(1);
        if (name == activeTheme) {
          out += `<link rel=stylesheet href=/styles/${name}.css />\n`;
        }
      } else {
        out += `<link rel=stylesheet href=/styles/${theme}.css />\n`;
      }
    });

    return out
  }

  includeMeta() {
    return ''
  }

  includeJS() {
    var out = '', scripts = this.getConfig('route.scripts');

    out += `<script src="/webpack/scripts/vendor.js"></script>\n`;
    out += `<script src="/webpack/scripts/polyfill.js"></script>\n`;
    out += `<script src="/webpack/scripts/start.js"></script>\n`;
    out += `<script src="/webpack/scripts/templates.js"></script>\n`;
    out += `<script src="/webpack/scripts/app.js"></script>\n`;

    //if (lo.isArray(scripts)) {
    //  scripts.forEach((url)=> {
    //    out += `<script src=/webpack${url}></script>\n`;
    //  })
    //}
    return out
  }

  includeJSOptions() {
    var data = JSON.stringify(this.serverConfigurations, null, 4);
    return `<script>window['serverConfigurations'] = ${data}</script>`
  }

  readConfig(url, overrideObj) {
    var out = null;
    var theme = lo.get(overrideObj, 'route.theme');
    if (lo.isString(url)) {
      var env = this.getEnv();
      var src = null;
      var name = null;
      var type = null;
      var configPath = null;
      var isAbs = path.isAbsolute(url);
      var mask = env.mask;
      if (!isAbs) {
        var srcPath = env.src;
        src = path.join(srcPath, url);
        type = path.basename(path.dirname(src));
        name = path.basename(src);
        configPath = path.resolve(path.join(src, path.basename(mask)));
      } else {
        src = path.dirname(url);
        type = path.basename(path.dirname(src));
        name = path.basename(src);
        configPath = url;
      }
      if (theme) {
        var theme_mask = path.resolve(path.join(src, '**', theme + '.yml'));
        var theme_files = globSync(theme_mask);
        configPath = (theme_files.length) ? theme_files[0] : configPath;
      }
      var config = yaml.safeLoad(fs.readFileSync(configPath, 'utf8')) || {};
      out = {name, src, config, configPath, type}
    }
    return out;
  }

  IF() {
    return ''
  }

  IF_NOT() {
    return ''
  }

  ENDIF() {
    return ''
  }

}
