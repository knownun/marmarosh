import path from 'path'

import Tasks from './gulp-tasks'
import Sintez from './components/marmarosh'

export function init(gulp) {
  var configPath = path.resolve("config.yml");
  var sintez = Sintez.fromPath(configPath);
  Tasks(gulp, sintez);
}
