import path from 'path';
import util from 'gulp-util';

import lo from 'lodash';

import Base from '../base-task';

import LessWatch from './css/watch';
import Server from '../../servers/marmarosh-server/index'

export default class Task extends Base {

  constructor(gulp, sintez) {
    super(gulp, sintez);
    this.watcher = new LessWatch(gulp, sintez);
    this.builder = this.sintez.createBuilder();
  }

  getDefaultTaskName() {
    return 'dev';
  }

  run(done) {
    var sintez = this.sintez;
    var resources = sintez.getResources();
    var components = resources.get('components');
    var scripts = resources.get("js");

    var applicationBuilder = this.builder.getApplicationBuilder();

    var options = {
      builder: applicationBuilder,
      server: sintez.get('server'),
      host: sintez.get('host'),
      port: sintez.get('port'),
      dest: sintez.getDest(),
      src: sintez.getSrc(),
      component: components.Development,
      themes: sintez.get("resources.css.themes"),
      scripts: scripts.getUrl(),
      serverConfigurations: sintez.get("serverConfigurations")
    };

    var server = new Server(options);

    this.logger.log("Starting watcher");
    this.watcher.run(()=> {
      this.logger.log("Starting server");
      server.run(done);
    });

  }

}
