import path from "path";
import url from "url";

const isWindows = process.platform === "win32";

export let toUnifiedPath = path => path.replace(/[\\\/]+/g, "/");
export let joinUrl = (...agrs) => url.resolve(agrs);
export let sep = (path.sep === "/") ? "\\x2f" : "\\x5c";
export let join = isWindows ? path.win32.join : path.posix.join;
export let resolve = isWindows ? path.win32.resolve : path.posix.resolve;
export let normalize = isWindows ? path.win32.normalize : path.posix.normalize;
export let dirname = isWindows ? path.win32.dirname : path.posix.dirname;
export let basename = isWindows ? path.win32.basename : path.posix.basename;
export let extname = isWindows ? path.win32.extname : path.posix.extname;
export let relative = isWindows ? path.win32.relative : path.posix.relative;

export {readConfig} from "./configUtils";
