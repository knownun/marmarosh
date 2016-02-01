import fs from 'fs'
import path from 'path'

import lo from 'lodash'
import yaml from 'js-yaml'
import {sync as globSync} from 'glob'

import Router from 'express/lib/router'

export default (options) => {

  var router = new Router;

  router.get('/view/:type/:name', (req, res) => {

    var type = req.params['type'];
    var name = req.params['name'];

    var html, component, child = null;

    var bodyPath = path.join(type, name);

    var params = {
      theme: req.query.t || req.query.theme || null
    };

    if (type === 'widgets') {
      child = new options.component(bodyPath, params);
      bodyPath = path.join('layout');
    }

    component = new options.component(bodyPath, {route: params}, child);
    html = component.getHTML();

    return res.send(html);

  });

  router.get('/styles/*', (req, res) => {
    return res.sendFile(req.url, {
      root: path.resolve(options.dest)
    });
  });

  router.get('/', (req, res) => {
    var configs = globSync(path.join(options.src, '**', 'config.yml'));
    var themes = lo.compact(lo.cloneDeep(options.themes).map((val)=> {
      if (lo.startsWith(val, '?')) {
        return val.substr(1)
      } else {
        return false
      }
    }));
    var files = [];

    configs.forEach((val) => {
      var arr = path.dirname(path.relative(options.src, val)).split(path.sep);
      var type = arr.shift();
      var dir = arr.join(path.sep);
      var name = path.basename(dir);
      if (name.length > 0) {
        var file = {
          type: type,
          href: path.join('view', type, dir),
          name: name,
          themes: {}
        };

        themes.forEach((val) => {
          file.themes[val] = path.join('view', type, dir) + "?theme=" + val
        });

        files.push(file)
      }
    });

    files = lo.groupBy(files, 'type');

    res.render('index', {
      files
    });
  });

  return router
}
