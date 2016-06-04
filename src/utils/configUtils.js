import fs from "fs";

import {resolve as resolvePath} from "./index";

export function readConfig(string) {
  return new Promise((resolve, reject) => {
    if (string) {
      const resolvedPath = resolvePath(string);
      fs.exists(resolvedPath, (exists) => {
        if (exists) {
          let module = require(resolvedPath);
          resolve((module.default) ? module.default : module);
        } else {
          reject(new Error(`Config not found in path ${resolvedPath}`));
        }
      });
    } else {
      reject(new Error("Config path not found."));
    }
  });
}

export default {readConfig};
