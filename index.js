var spsave = require('spsave'),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError,
    path = require("path"),
	through = require("through2");

var PLUGIN_NAME = 'gulp-spsave';

function gulpspsave(options) {
	if (!options) {
		throw new PluginError(PLUGIN_NAME, 'Missing options');
	}

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return cb();
		}

		if (file.isBuffer()) {
			if (!options.notFlat){
				options.fileName = path.basename(file.path);
			} else {
				var relative = path.relative(file.base, file.path);
				options.fileName = path.basename(file.path);
				var addFolder = relative.replace(options.fileName, "");
				var destFolder = path.join(options.folder, addFolder).replace(/\\/g, '/');
				options.folder = destFolder;
			}
			options.fileContent = file.contents.toString(enc);

			spsave(options, function (err, data) {
				if (err) {
					console.log(err);
					this.emit('error', new PluginError(PLUGIN_NAME, err.message));
				}

				return cb();
			});
		}
	});
}

module.exports = gulpspsave;