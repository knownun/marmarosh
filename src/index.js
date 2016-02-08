import {resolve} from "./utils/helpers"

import Tasks from "./gulp-tasks"
import Sintez from "./components/marmarosh"

export function init(gulp) {
  var configPath = resolve("config.yml");
  var sintez = Sintez.fromPath(configPath);
  Tasks(gulp, sintez);
}
