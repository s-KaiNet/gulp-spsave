# gulp-spsave
Gulp plugin for saving files inside SharePoint. 

----------

Install: 
---

`npm install gulp-spsave`  

Options:   
---
Exactly the same as for [spsave](https://github.com/s-KaiNet/spsave), except: 

 - `fileName` - extracted by plugin automatically, no need to provide 
 - `fileContent` - also extracted by plugin automatically, no need to provide
 - `flatten` - boolean, default true, when true all files will be uploaded to `folder` provided for the spsave regardles of the file phisical location. For example, if folder equal to `MyAppAssets` and you are piped two files `app/controllers/HomeCtrl.js` and `app/templates/home.html`, then `MyAppAssets` will contain both `HomeCtrl.js` and `home.html` in the root.   
	 If `flatten` is false, `gulp-spsave` will look for base for the file and will use this base for upload file in a particular folder (or create this folder automatically if required). See [gulp API docs](https://github.com/gulpjs/gulp/blob/master/docs/API.md), `gulp.src(globs[, options])` and [glob2base](https://github.com/contra/glob2base).   

Examples:
--    

1. Watch for file changes in scripts, then bundle, minify, whatever, and upload to SharePoint automatically:

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
2. Save all files from `App/build` to SharePoint:
```javascript
gulp.task("spsave", function () {
	return gulp.src(["App/build/*.*"])
		.pipe($.spsave({
			siteUrl: settings.siteUrl,
			username: settings.username,
			password: settings.password,
			folder: "App/build",
			flatten: true
		}));
});
```  
3. Watch all javascript file changes in `ng` (stands for angular) folder and upload that file automatically in SharePoint with preserved folder structure: 

```javascript
gulp.watch("App/ng/**/*.js", function (event) {
		console.log(event.path);
		gulp.src(event.path)
			.pipe($.spsave({
				siteUrl: settings.siteUrl,
				username: settings.username,
				password: settings.password,
				folder: "AppAssets",
				flatten: false
			}));
	});
```  
In this sample `base` will be equal to `App/ng`. If file path is `App/ng/controllers/HomeCtrl.js`, then it will saved under `AppAssets/controllers/HomeCtrl.js` (if some folders are missing, they will be created by `spsave` automatically). Next sample demonstrate how can you save it under `AppAssets/ng/controllers/HomeCtrl.js`  
4. You can also explicitly provide `base` for `gulp.src`:  

```javascript
gulp.watch("App/ng/**/*.js", function (event) {
		console.log(event.path);
		gulp.src(event.path, { base: "App" })
			.pipe($.spsave({
				siteUrl: settings.siteUrl,
				username: settings.username,
				password: settings.password,
				folder: "AppAssets",
				flatten: false
			}));
	});
```  
In this case file be saved under `AppAssets/ng/controllers/HomeCtrl.js` path.   

...and any other scenarious you need.

For list of all options for the `spsave` refer to the [git hub repository](https://github.com/s-KaiNet/spsave).