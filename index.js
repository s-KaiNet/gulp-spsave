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
            options.fileName = path.basename(file.path);
            options.fileContent = file.contents.toString(enc);    
			
			spsave(options, function(err, data){
				if(err){
					console.log(err);
					this.emit('error', new PluginError(PLUGIN_NAME, err.message));
				}
				
				return cb();
			});            
        }
    });
}

module.exports = gulpspsave;