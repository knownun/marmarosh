import Build from './src/package/build';
import Clear from './src/package/clear';
import Watch from './src/package/watch';

import Dev from './src/dev';

import TaskManager from './gulp-task-manager';

export default (gulp, sintez) => {
  var taskManager = new TaskManager(gulp);
  taskManager.add(new Build(gulp, sintez));
  taskManager.add(new Clear(gulp, sintez));
  taskManager.add(new Watch(gulp, sintez));
  taskManager.add(new Dev(gulp, sintez));
};
