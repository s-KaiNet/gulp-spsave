var spsave = require('c:/Projects/spsave/lib/src/index').spsave,
  gutil = require('gulp-util'),
  PluginError = gutil.PluginError,
  path = require("path"),
  through = require("through2"),
  extend = require('util')._extend;

var PLUGIN_NAME = 'gulp-spsave';

function gulpspsave(options) {
  if (!options) {
    throw new PluginError(PLUGIN_NAME, 'Missing options');
  }

  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return;
    }

    if (file.isBuffer()) {
      if (typeof options.flatten !== "boolean") {
        options.flatten = true;
      }
      var newOptions = extend({}, options);
      newOptions.fileName = path.basename(file.path);
      if (!options.flatten) {
        var relative = path.relative(file.base, file.path);
        var addFolder = relative.replace(newOptions.fileName, "");
        var destFolder = path.join(options.folder, addFolder).replace(/\\/g, '/');
        newOptions.folder = destFolder;
      }
      newOptions.fileContent = file.contents;
      var self = this;
      spsave(newOptions, function (err, data) {
        if (err) {
          console.log(err);
          cb(new gutil.PluginError(PLUGIN_NAME, err.message));
          return;
        }
        cb(null, file);
      });
    }
  });
}

module.exports = gulpspsave;
