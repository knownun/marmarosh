import path from 'path'

import Sintez from './components/sintez'
//import TaskManager from './gulp-tasks/gulp-task-manager'

//import Tasks from './gulp-tasks'

export default (gulp) => {

  var configName = 'marmarosh';

  var sintez = Sintez.fromPath(path.resolve(`${configName}.yml`));

  console.log(sintez.getBuilder());

  return sintez
}
