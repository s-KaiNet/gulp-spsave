# gulp-spsave
Gulp plugin for saving files inside SharePoint. 

----------

Install: 
---

`npm install gulp-spsave`  

Usage:   
---
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

Watch for file changes in scripts, then bundle, minify, whatever, and upload to SharePoint automatically:

```javascript
gulp.task("buildJS", function(){
	return gulp.src("./Scripts/**/*.js")
	.pipe(concat())
	.pipe(uglify())
	.pipe(gulp.dest("./build"));
});

gulp.task("copyToSharePoint", ["buildJS"], function(){
	return gulp.src("./build/*.js")
		.pipe(spsave({
			username: settings.username,
			password: settings.password,
			siteUrl: settings.siteUrl,
			folder: "YourAppAssets/js"
		}));
});

gulp.task("watch", function(){
	gulp.watch(["./Scripts/**/*.js"], ["copyToSharePoint"]);
});
```  
  
...and any other scenarious you need.

New parameter - `notFlat` set to true to force spsave to add the relative path of streamed file to appear in SharePoint. 
```javascript
gulp.src("./dist/**/*")
.pipe(spsave({
			username: settings.username,
			password: settings.password,
			siteUrl: settings.siteUrl,
			notFlat: true,
			folder: "YourAppAssets"
		}));
```
and you got ./dist/styles/style.css - spsave will save this file to SharePoint to "YourAppAssets/styles/style.css"

Options for the `spsave` are exactly the same, except `fileName` and `fileContent` and `notFlat`, which are parsed by gulp plugin automatically. For list of all options for the `spsave` refer to the [git hub repository](https://github.com/s-KaiNet/spsave).