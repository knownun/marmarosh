import { resolve as joinUrl } from "url";

import { join } from "path";
import { sync as globSync } from "glob";

import isArray from "lodash/isArray";
import uniq from "lodash/uniq";

import BaseResource from "./base-resource";

export default class TemplatesResource extends BaseResource {

  static collect(src, paths) {
    paths = isArray(paths) ? paths : [paths];
    let templates = [];

    for (let path of paths) {
      let modulePath = join(src, path);
      let collected = globSync(modulePath, {nosort: true});
      if (collected.length) {
        let processedScripts = collected.map((script) => "./" + script);
        templates = templates.concat(processedScripts);
      } else {
        templates.push(path);
      }
    }

    return templates;
  }

  normalize(key, config, options) {
    let normalized = super.normalize(key, config, options);
    normalized.serverReplaceVars = options.globals.serverReplaceVars;
    normalized.themes = config.themes;
    return normalized;
  }

  getSrc() {
    let relativeSrc = this.getRelativeSrc();
    let src = this.getProjectSrc();
    let resourceSrc = isArray(relativeSrc) ? relativeSrc : [relativeSrc];
    let output = [];

    for (let path of resourceSrc) {
      let collected = TemplatesResource.collect(src, path);
      output = output.concat(collected);
    }

    return uniq(output);
  }

  get extensions() {
    return this.getConfig().extensions || [".yml"];
  }

}
