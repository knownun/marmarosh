import fs from "fs";
import mkdirp from "mkdirp";
import events from "events";

import isArray from "lodash/isArray";
import isObject from "lodash/isObject";
import isEmpty from "lodash/isEmpty";
import isUndefined from "lodash/isUndefined";
import pick from "lodash/pick";
import forOwn from "lodash/forOwn";
import startsWith from "lodash/startsWith";
import mapValues from "lodash/mapValues";
import merge from "lodash/merge";

import glob from "glob";

import ProdComponentClass from "./component";
import defaultTemplateHelpers from "./tplHelpers";
import {join, normalize, dirname, relative} from "../utils";

const local = {
  events: Symbol("events"),
  normalized: Symbol("normalized")
};

export default class Builder {

  constructor(config) {
    this[local.events] = new events.EventEmitter();
    this[local.normalized] = this.normalize(config);
    this.templateHelpers = Builder.getHelpers(config);
  }

  static getHelpers(config = {}) {
    return merge({}, defaultTemplateHelpers, config.helpers);
  }

  on(event, fn) {
    this[local.events].on(event, fn);
    return this;
  }

  once(event, fn) {
    this[local.events].once(event, fn);
    return this;
  }

  remove(event) {
    this[local.events].removeAllListeners(event);
    return this;
  }

  emit(event, params) {
    this[local.events].emit(event, params);
    return this;
  }

  normalize(data) {
    let normalized = [];

    if (isArray(data)) {
      normalized = data.map((config)=> {

        config.events = {
          done: ({msg})=> {
            console.log(`Building: ${msg}`);
          },
          error: ({message})=> {
            console.log(`Error: ${message}`);
          }
        };

        forOwn(config.events, (fn, key) => {
          this.on(key, fn);
        });

        config.src = glob.sync(config.src);

        return {
          root: config.root,
          src: config.src,
          dest: config.dest,
          debug: config.debug,
          themes: config.themes,
          serverReplace: config.serverReplace
        };
      });
    } else {
      normalized = this.normalize([data]);
    }
    return normalized;
  }

  get config() {
    return this[local.normalized];
  }

  static createFile(filePath, data) {
    return new Promise((done, failled)=> {
      mkdirp(dirname(filePath), (err) => {
        if (err) return failled(err);
        fs.writeFile(filePath, data, "utf8", (err)=> {
          if (err) return failled(err);
          done(filePath);
        });
      });
    });
  }

  static createJSON({name, config, includes, hasJS}) {
    let data = {};

    if (config.isMasterPage) {
      data.isMasterPage = config.isMasterPage;
    }

    if (config.hasJS || hasJS) {
      data.hasJs = true;
    }

    if (startsWith(name, "react")) {
      data.isReact = true;
    }

    if (isObject(config.template_options)) {
      data.template_options = Builder.getVars(config.template_options, ["default", "values"]);
    }

    if (isObject(config.layout_options)) {
      data.layout_options = Builder.getVars(config.layout_options, ["default", "values"]);
    }

    if (isObject(config.script_options)) {
      data.script_options = Builder.getVars(config.script_options, ["default", "values"]);
    }

    if (isObject(config.strings)) {
      data.strings = Builder.getVars(config.strings, ["default"], "default");
    }

    if (isObject(config.images)) {
      data.images = Builder.getVars(config.images, ["default"], "default");
    }

    if (isObject(config.links)) {
      data.links = Builder.getVars(config.links, ["default"], "default");
    }

    data.widgets = merge(includes, config.widgets);

    return JSON.stringify(data, null, 2);
  }

  static getVars(input, properties, map) {
    let output = {};
    forOwn(input, (value, key) => {
      if (!startsWith(key, "$")) {
        if (isObject(value)) {
          let obj = null;
          if (!isUndefined(value)) {
            obj = properties ? pick(value, properties) : value;
            if (!isEmpty(obj)) {
              output[key] = obj;
            }
          }
        } else if (!isEmpty(value)) {
          output[key] = value;
        }
      }
    });

    if (map) {
      mapValues(output, map);
    }

    return output;
  }

  static getSecondaryThemesConfig(config) {
    let normalizedSecondaryConfig = [];
    forOwn(config, (val, key)=> {
      if (startsWith(val, "?")) {
        normalizedSecondaryConfig.push(key);
      }
    });
    return normalizedSecondaryConfig;
  }

  run() {

    const errHandler = (err) => this.emit("error", err);

    this.config.forEach((config)=> {
      const Constructor = ProdComponentClass;
      const components = config.src;
      const themes = Builder.getSecondaryThemesConfig(config.themes);
      if (components) {
        components.forEach((filePath) => {
          let MainInstance = new Constructor();
          let MainConfigPath = normalize(filePath);
          MainInstance.setHelpers(this.templateHelpers);

          MainInstance
            .load(MainConfigPath)
            .then(({component}) => {
              return component.getTemplate();
            }, errHandler)
            .then(({component, data}) => {

              let dest = config.dest;
              let name = component.name;
              let type = component.type;

              let cshtmlFilePath = join(dest, type, name, `${name}.cshtml`);
              let jsonFilePath = join(dest, type, name, `${name}.json`);

              let jsonData = Builder.createJSON({
                name: component.name,
                config: component.config,
                includes: component.widgets
              });

              Builder.createFile(cshtmlFilePath, data);
              Builder.createFile(jsonFilePath, jsonData);

              return Promise.resolve({component});
            }, errHandler)
            .then(({component})=> {
              return component.getAvailableThemes(themes);
            }, errHandler)
            .then(({component, data})=> {
              data.forEach(({theme, isAvailable}) => {
                  if (isAvailable) {
                    let ThemeInstance = new Constructor();
                    ThemeInstance.setHelpers(this.templateHelpers);

                    component
                      .getConfigPath(theme)
                      .then((path)=> {
                        return Promise.resolve(path);
                      }, () => {
                        return Promise.resolve(MainConfigPath);
                      })
                      .then((themeConfigPath) => {
                        ThemeInstance
                          .load(themeConfigPath)
                          .then(({component}) => {
                            return component.getTemplate(theme);
                          }, errHandler)
                          .then(({component, data})=> {

                            let dest = config.dest;

                            let type = MainInstance.type;
                            let name = MainInstance.name;

                            let cshtmlFilePath = join(dest, type, name, "themes", theme, `${name}.cshtml`);
                            let jsonFilePath = join(dest, type, name, "themes", theme, `${name}.json`);

                            let jsonData = Builder.createJSON({
                              name: component.name,
                              config: component.config,
                              includes: component.widgets,
                              hasJS: MainInstance.hasIndexJS
                            });

                            Builder.createFile(cshtmlFilePath, data);
                            Builder.createFile(jsonFilePath, jsonData);

                          }, errHandler);
                      }).catch(errHandler);
                  }
                }
              );
            }).catch(errHandler);
        });
      }
    });
  }
}
