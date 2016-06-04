import Builder from "./builder";
import {readConfig} from "./utils";

const args = process.argv;
const builderArgs = args.slice(2);
const configPath = builderArgs[0];

readConfig(configPath).then((config) => {
  const builder = new Builder(config);
  return builder.run(() => {
    console.log("Done");
  });
}).catch((err) => {
  console.error(err);
  return Promise.reject(err);
});
