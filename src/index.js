import path from "path";
import fs from "fs";

import Builder from "./builder";

const args = process.argv;
const builderArgs = args.slice(2);
const configPath = builderArgs[0];

// Helpers
// ---------------------------

function readConfig(string) {
  return new Promise((resolve, reject) => {
    if (string) {
      const resolvedPath = path.resolve(string);
      fs.exists(resolvedPath, (exists) => {
        if (exists) {
          resolve(require(resolvedPath));
        } else {
          reject(new Error(`Config not found in path ${resolvedPath}`));
        }
      });
    } else {
      reject(new Error("Config path not found."));
    }
  });
}

readConfig(configPath).then((config) => {
  const builder = new Builder(config);
  builder.run(() => {
    console.log("Done");
  });
}).catch((err) => {
  console.error(err);
  return Promise.reject(err);
});
