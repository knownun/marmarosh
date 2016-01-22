import { resolve as joinUrl } from "url";

import { join } from "path";
import { sync as globSync } from "glob";

import isArray from "lodash/isArray";

import BaseResource from "./base-resource";

export default class JsResoruce extends BaseResource {

  static collectScripts(src, paths) {
    paths = isArray(paths) ? paths : [paths];
    let scripts = [];

    for (let path of paths) {
      let modulePath = join(src, path);
      let collected = globSync(modulePath, {nosort});
      if (collected.length) {
        let processedScripts = collected.map((script) => "./" + script);
        scripts = scripts.concat(processedScripts);
      } else {
        scripts.push(path); // Workaround for dev. step when using npm link this package
      }
    }

    return scripts;
  }

  getSrc() {
    let relativeSrc = this.getRelativeSrc();
    let src = this.getProjectSrc();
    let resourceSrc = isArray(relativeSrc) ? relativeSrc : [relativeSrc];
    let output = [];

    for (let path of resourceSrc) {
      let collected = JsResoruce.collectScripts(src, path);
      output = output.concat(collected);
    }

    return output;
  }

  getUrl() {
    let url = super.getUrl();
    let split = this.getOptions("split");
    let output = [];

    if (split) {
      let target = this.getRelativeTarget();
      for (let name of Object.keys(split)) {
        output.push(joinUrl("/", target, name + ".js"));
      }
    }

    output.push(url);

    return output;
  }
}
