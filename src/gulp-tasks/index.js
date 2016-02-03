import BuildTask from "./src/build";
import CleanTask from "./src/clean";
import JSTask from "./src/javascript";
import LessTask from "./src/styles";
import TemplatesTask from "./src/templates";
import DevelopmentTask from "./src/development";

import TaskManager from "./gulp-task-manager";

export default (gulp, sintez) => {
  var taskManager = new TaskManager(gulp);

  taskManager.add(new BuildTask(gulp, sintez));
  taskManager.add(new CleanTask(gulp, sintez));
  taskManager.add(new JSTask(gulp, sintez));
  taskManager.add(new LessTask(gulp, sintez));
  taskManager.add(new TemplatesTask(gulp, sintez));

  taskManager.add(new DevelopmentTask(gulp, sintez));
};
