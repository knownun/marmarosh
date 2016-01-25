import path  from 'path';
import url  from 'url';

export let toUnifiedPath = path => path.replace(/[\\\/]+/g, '/');
export let joinUrl = (...agrs) => url.resolve(agrs);
export let sep = (path.sep === '/') ? '\\x2f' : '\\x5c';
