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

import ProdComponentClass from "./components/production_component";
// import DefaultTemplateHelpersClass from "../helpers/template";
import {join, normalize, dirname} from "../utils/helpers";

const local = {
  events: Symbol("events"),
  normalized: Symbol("normalized")
};

export default class Builder {

  constructor(config) {
    this[local.events] = new events.EventEmitter();
    this.config = this.normalize(config);
    // this.templateHelpers = Builder.initHelpers(config);
  }

  // static initHelpers(config = {}) {
  //   let result = null;
  //   if (typeof config.TemplateHelpersClass === "function") {
  //     const Helpers = new config.TemplateHelpersClass(config);
  //     if (Helpers instanceof DefaultTemplateHelpersClass) {
  //       result = Helpers;
  //     } else {
  //       throw new Error("Invalid config.templateHelpersClass");
  //     }
  //   } else {
  //     result = new DefaultTemplateHelpersClass(config);
  //   }
  //   return result;
  // }

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

  set config(data) {
    this[local.normalized] = data;
  }

  static getNewFilename(instance, ext, theme) {
    var name = instance.getName();
    var dir = `${instance.getType()}/${instance.getName()}`;
    return theme ? `${dir}/themes/${theme}/${name}.${ext}` : `${dir}/${name}.${ext}`;
  }

  static createFile(dir, fileName, data) {
    var folder = join(dir, dirname(fileName));
    mkdirp.sync(folder);
    fs.writeFileSync(join(dir, fileName), data, "utf8");
    return true;
  }

  getVars(input, properties, map) {
    var output = {};
    forOwn(input, (value, key) => {
      if (!startsWith(key, "$")) {
        if (isObject(value)) {
          var obj = null;
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

  static createCSHTML(instance, output, theme) {
    var name = Builder.getNewFilename(instance, "cshtml", theme);
    var data = instance.getHTML(theme || "main") || "";
    return Builder.createFile(output, name, data);
  }

  createJSON(instance, output, theme) {
    var name = Builder.getNewFilename(instance, "json", theme);
    var config = instance.getConfig();

    var getVars = this.getVars;

    var data = {};

    if (config.isMasterPage) {
      data.isMasterPage = config.isMasterPage;
    }

    if (instance.hasIndexJS) {
      data.hasJs = true;
    }

    if (startsWith(instance.getName(), "react")) {
      data.isReact = true;
    }

    if (isObject(config.template_options)) {
      data.template_options = getVars(config.template_options, ["default", "values"]);
    }

    if (isObject(config.layout_options)) {
      data.layout_options = getVars(config.layout_options, ["default", "values"]);
    }

    if (isObject(config.script_options)) {
      data.script_options = getVars(config.script_options, ["default", "values"]);
    }

    if (isObject(config.strings)) {
      data.strings = getVars(config.strings, ["default"], "default");
    }

    if (isObject(config.images)) {
      data.images = getVars(config.images, ["default"], "default");
    }

    if (isObject(config.links)) {
      data.links = getVars(config.links, ["default"], "default");
    }

    data.widgets = instance.widgets || {};

    if (theme) {
      JSON.stringify(instance.widgets);
    }

    if (isObject(config.widgets)) {
      data.widgets = merge(data.widgets, config.widgets);
    }

    return Builder.createFile(output, name, JSON.stringify(data, null, 2));
  }

  getSecondaryThemesConfig(config) {
    let normalizedSecondaryConfig = [];
    forOwn(config, (val, key)=> {
      if (startsWith(val, "?")) {
        normalizedSecondaryConfig.push(key);
      }
    });
    return normalizedSecondaryConfig;
  }

  run(done) {

    this.config.forEach((config)=> {
      try {
        const Constructor = ProdComponentClass;
        const components = config.src;
        const output = config.dest;
        const themes = this.getSecondaryThemesConfig(config.themes);

        if (components) {
          components.forEach((filePath, index) => {
            let instance = new Constructor(normalize(filePath), {
              builder: {
                serverReplace: config.serverReplace
              }
            });

            Builder.createCSHTML(instance, output);

            this.createJSON(instance, output);

            themes.forEach((name)=> {
              if (instance.hasTemplateForTheme(name) || instance.hasConfigForTheme(name)) {
                const themeInstance = new Constructor(normalize(filePath), {
                  route: {
                    theme: name
                  },
                  builder: {
                    serverReplace: config.serverReplace
                  }
                });
                Builder.createCSHTML(themeInstance, output, name);
                this.createJSON(themeInstance, output, name);
              }
            });

            const itemIndex = index + 1;
            const allLength = components.length;
            const msg = `${itemIndex}/${allLength} built templates`;

            this.emit("done", {msg});

          });
          this.emit("end", {files: components.length});
        }
      } catch (e) {
        this.emit("error", {message: e.message});
      }

    });

    done && done();

  }
}
