# gulp-spsave
Gulp plugin for saving files inside SharePoint. 

----------

###Install: 

`npm install gulp-spsave`  

###Usage:   
Watch all javascript files and upload them automatically in a folder (library):

```javascript
var spsave = require("gulp-spsave"),
	gulp = require("gulp");


gulp.task("watch", function(){
	gulp.watch("*.js", function(event){
		gulp.src(event.path)
		.pipe(spsave({
			username: "[username]",
			password: "[password]",
			siteUrl: "[full site url]",
			folder: "Shared Documents",
			appWebUrl: "MyApp"
		}));
	});
});
```   

Bundle and minify your javascript and automatically upload to SharePoint folder (library):

```javascript
gulp.task("build", ["minifyjs"], function(){
	return gulp.src("./Scripts/build/*.js")
		.pipe(spsave({
				username: "[username]",
				password: "[password]",
				siteUrl: "[full site url]",
				folder: "Site Assets"
			}));
});
```  

Options for the `spsave` are exactly the same, except `fileName` and `fileContent`, which are parsed by gulp plugin automatically. For list of all options for the `spsave` refer to the [git hub repository](https://github.com/s-KaiNet/spsave).