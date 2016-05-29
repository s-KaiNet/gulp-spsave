var spsave = require('spsave').spsave,
  gutil = require('gulp-util'),
  PluginError = gutil.PluginError,
  path = require("path"),
  through = require("through2"),
  _ = require('lodash'),
  notifier = require('node-notifier');

var PLUGIN_NAME = 'gulp-spsave';

function gulpspsave(options) {
  if (!options) {
    throw new PluginError(PLUGIN_NAME, 'Missing options');
  }

  var files = [];
  var newOptions = _.defaults(_.assign({}, options), {
    flatten: true
  });
  
  var notify = options.notification;
  newOptions.notification = false;

  function uploadFile(file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return;
    }

    if (file.isBuffer()) {
      if (options.flatten) {
        file.base = null;
      }

      newOptions.file = file;
      files.push(path.basename(file.path));
      spsave(newOptions)
        .then(function () {
          cb(null, file);
        })
        .catch(function (err) {
          cb(new gutil.PluginError(PLUGIN_NAME, err.message));
          return;
        });
    }
  }

  function endStream(cb) {

    var showNotification = function (message, title) {
      if (notify) {
        notifier.notify({
          title: title || 'spsave',
          message: message,
          icon: path.join(__dirname, 'assets/sp.png'),
        }, function (err) {
          if (err) {
            cb(new gutil.PluginError(PLUGIN_NAME, err));
            return;
          }
          
          cb();
        });
      } else {
        cb();
      }
    };

    if (files.length > 1) {
      showNotification(files.length + ' files successfully uploaded');
    } else if (files.length === 1) {
      showNotification('Successfully uploaded', 'spsave: ' + files[0]);
    } else {
      cb();
    }
  }

  return through.obj(uploadFile, endStream);
}

module.exports = gulpspsave;
