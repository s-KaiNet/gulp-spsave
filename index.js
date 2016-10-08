var spsave = require('spsave').spsave,
  gutil = require('gulp-util'),
  PluginError = gutil.PluginError,
  path = require("path"),
  through = require("through2"),
  _ = require('lodash'),
  notifier = require('node-notifier');

var PLUGIN_NAME = 'gulp-spsave';

function gulpspsave(coreOptions, creds) {
  if (!coreOptions || !creds) {
    throw new PluginError(PLUGIN_NAME, 'Missing parameters');
  }

  var files = [];
  var newOptions = _.defaults(_.assign({}, coreOptions), {
    flatten: true
  });

  var notify = coreOptions.notification;
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
      var oldBase = file.base;
      if (newOptions.flatten) {
        file.base = null;
      }

      var fileName = path.basename(file.path);
      files.push(fileName);
      spsave(newOptions, creds, {
        file: file, 
        folder: newOptions.folder
      })
        .then(function () {
          file.base = oldBase;
          cb(null, file);
          return null;
        })
        .catch(function (err) {
          if (notify) {
            notifier.notify({
              title: `spsave: ${fileName}: error occured`,
              message: 'For details see console log',
              icon: path.join(__dirname, 'assets/sp_error.png')
            });
          }
          cb(new gutil.PluginError(PLUGIN_NAME, err));
          return;
        });
    }
  }

  function endStream(cb) {
    var showNotification = function () {
      notifier.notify({
        title: `spsave: ${files.length} file(s) uploaded`,
        message: files.join(', '),
        icon: path.join(__dirname, 'assets/sp.png')
      }, function (err) {
        if (err) {
          cb(new gutil.PluginError(PLUGIN_NAME, err));
          return;
        }

        cb();
      });

    };

    if (files.length > 0 && notify) {
      try {
        showNotification();
      } catch (err) {
        cb(new gutil.PluginError(PLUGIN_NAME, err));
      }
    } else {
      cb();
    }
  }

  return through.obj(uploadFile, endStream);
}

module.exports = gulpspsave;
