import path from 'path'

import Marmarosh from './components/marmarosh'

//import TaskManager from './gulp-tasks/gulp-task-manager'
//import Tasks from './gulp-tasks'

export function init(gulp) {
  var configPath = path.resolve("config.yml");

  return Marmarosh.fromPath(configPath);
}
