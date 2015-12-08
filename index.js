var spsave = require('spsave'),
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
			if(typeof options.flatten !== "boolean"){
				options.flatten = true;
			}
			if (options.flatten){
				options.fileName = path.basename(file.path);
			} else {
				var relative = path.relative(file.base, file.path);
				options.fileName = path.basename(file.path);
				var addFolder = relative.replace(options.fileName, "");
				var destFolder = path.join(options.folder, addFolder).replace(/\\/g, '/');
				var newOptions = extend({}, options);
				newOptions.folder = destFolder;
			}
			newOptions.fileContent = file.contents.toString(enc);
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