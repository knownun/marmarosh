import path from 'path'

import Sintez from './components/sintez'
import TaskManager from './gulp-tasks/gulp-task-manager'

import Tasks from './gulp-tasks'

export default (gulp) => {

  var configName = 'config';

  var sintez = Sintez.fromPath(path.resolve(`${configName}.yml`));

  Tasks(gulp, sintez);

  return sintez

}
