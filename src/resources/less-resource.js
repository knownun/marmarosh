import { resolve as joinUrl } from "url";
import { sync as globSync } from "glob";

import isArray from "lodash/isArray";
import uniq from "lodash/uniq";

import BaseResource from "./base-resource";
import { join } from "../utils/helpers";


export default class LessResource extends BaseResource {

  static collectScripts(src, paths) {
    paths = isArray(paths) ? paths : [paths];
    let scripts = [];

    for (let path of paths) {
      let modulePath = join(src, path);
      let collected = globSync(modulePath, {nosort: false});
      if (collected.length) {
        let processedScripts = collected.map((script) => "./" + script);
        scripts = scripts.concat(processedScripts);
      }
    }
    return scripts;
  }

  get themes() {
    return this.getConfig().themes;
  }

  get extensions() {
    return this.getConfig().extensions || [".less"];
  }

  getSrc() {
    let relativeSrc = this.getRelativeSrc();
    let src = this.getProjectSrc();
    let resourceSrc = isArray(relativeSrc) ? relativeSrc : [relativeSrc];
    let output = [];

    for (let path of resourceSrc) {
      let collected = LessResource.collectScripts(src, path);
      output = output.concat(collected);
    }

    return uniq(output);
  }

  getUrl() {
    let url = super.getUrl();
    let split = this.getOptions("split");
    let output = [];

    if (split) {
      let target = this.getRelativeTarget();
      for (let name of Object.keys(split)) {
        output.push(joinUrl("/", target, name + ".css"));
      }
    }

    output.push(url);

    return output;
  }
}
