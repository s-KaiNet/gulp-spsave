# gulp-spsave 

[![NPM](https://nodei.co/npm/gulp-spsave.png?mini=true)](https://nodei.co/npm/gulp-spsave/)  
[![npm version](https://badge.fury.io/js/gulp-spsave.svg)](https://badge.fury.io/js/gulp-spsave)

### Need help on SharePoint with Node.JS? Join our gitter chat and ask question! [![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/sharepoint-node/Lobby)

Gulp plugin for [spsave](https://github.com/s-KaiNet/spsave) - save files in SharePoint using node.js easily. 

----------

## How to use:
#### Install:
```bash
npm install gulp-spsave --save-dev
```
#### Usage:

```javascript
var spsave = require('gulp-spsave');
var gulp = require('gulp');

gulp.task("default", function(){
  return gulp.src("./build/*.js")
             .pipe(spsave(coreOptions, creds));
});
```

## Options:   

Exactly the same as for [spsave](https://github.com/s-KaiNet/spsave), except file content options (because the file is piped through the gulp stream).  
That means no need to provide such options as `fileName`, `fileContent`, `glob`, `file`, `base` (`base` can be provided for the `gulp.src`, see samples below).  
It's recommended to take a look at the [spsave](https://github.com/s-KaiNet/spsave) page to have better understanding.

#### Core options (passed to `spsave`):
The same as for [spsave core options](https://github.com/s-KaiNet/spsave#core-options) plus two additional exclusive to `gulp-spsave`:
 - `folder` - required string, SharePoint folder to upload file to (can be the url to document library)
 - `flatten` - boolean, default true, when true all files will be uploaded to `folder` provided, regardles of the file phisical location. For example, if folder equal to `MyAppAssets` and you are piped two files `app/controllers/HomeCtrl.js` and `app/templates/home.html`, then `MyAppAssets` will contain both `HomeCtrl.js` and `home.html` in the root.   
	 If `flatten` is false, `gulp-spsave` will look for base for the file and will use this base for upload file in a particular folder (or create this folder automatically if required). See [gulp API docs](https://github.com/gulpjs/gulp/blob/master/docs/API.md), `gulp.src(globs[, options])` and [glob2base](https://github.com/contra/glob2base).   

#### Credentials:

`gulp-spsave` implicitly depends on another module used for SharePoint authentication from node js - [node-sp-auth](https://github.com/s-KaiNet/node-sp-auth). For credentials param you need to pass exactly the same object, as for `node-sp-auth` [credentialsOptions object](https://github.com/s-KaiNet/node-sp-auth#params). That also means that `gulp-spsave` supports all authentication options supported by `node-sp-auth`. See examples below for more info.  
You can also pass a `null` as credentials, in that case `gulp-spsave` will ask you for credentials and will store your credentials in a user folder in an encrypted manner (everything is handled by `node-sp-auth` actually). 

Examples:
--    

Imagine we have `settings.js` which stores all sensitive information for us (credential information, client id\client secret etc.): 

```javascript
module.exports = {
    username: "[user]",
    password: "[pass]"
}
```

1.Watch for file changes in scripts, then bundle, minify, whatever, and upload to SharePoint automatically:

----------


```javascript
//sensitive data stored in external file:
var creds = require("./settings.js");
gulp.task("buildJS", function(){
	return gulp.src("./Scripts/**/*.js")
	.pipe(concat())
	.pipe(uglify())
	.pipe(gulp.dest("./build"));
});

gulp.task("copyToSharePoint", ["buildJS"], function(){
	return gulp.src("./build/*.js")
		.pipe(spsave({
			siteUrl: settings.siteUrl,
			folder: "YourAppAssets/js"
		}, creds));
});

gulp.task("watch", function(){
	gulp.watch(["./Scripts/**/*.js"], ["copyToSharePoint"]);
});
```  
2.Save all files from `App/build` to SharePoint:

----------

```javascript
//sensitive data stored in external file:
var creds = require("./settings.js");
gulp.task("spsave", function () {
	return gulp.src(["App/build/*.*"])
		.pipe($.spsave({
			siteUrl: settings.siteUrl,
			folder: "App/build",
			flatten: true
		}, creds));
});
```  
3.Watch all javascript file changes in `ng` (stands for angular) folder and upload that file automatically in SharePoint with preserved folder structure: 

----------


```javascript
//sensitive data stored in external file:
var creds = require("./settings.js");
gulp.watch("App/ng/**/*.js", function (event) {
		gulp.src(event.path)
			.pipe($.spsave({
				siteUrl: settings.siteUrl,
				folder: "AppAssets",
				flatten: false
			}, creds));
	});
```  
In this sample `base` will be equal to `App/ng`. If file path is `App/ng/controllers/HomeCtrl.js`, then it will saved under `AppAssets/controllers/HomeCtrl.js` (if some folders are missing, they will be created by `spsave` automatically). Next sample demonstrate how can you save it under `AppAssets/ng/controllers/HomeCtrl.js` 

4.You can also explicitly provide `base` for `gulp.src`: 

----------
 
```javascript
//sensitive data stored in external file:
var creds = require("./settings.js");
gulp.watch("App/ng/**/*.js", function (event) {
		gulp.src(event.path, { base: "App" })
			.pipe($.spsave({
				siteUrl: settings.siteUrl,
				folder: "AppAssets",
				flatten: false
			}, creds));
	});
```  
In this case file be saved under `AppAssets/ng/controllers/HomeCtrl.js` path.   

5.Upload search display template with metadata:

----------

```javascript
//sensitive data stored in external file:
var creds = require("./settings.js");
gulp.watch("App/search/Item_Display.js", function (event) {
		gulp.src(event.path)
			.pipe($.spsave({
				siteUrl: settings.siteUrl,
				folder: "_catalogs/masterpage/Display Templates/Search",
				flatten: true,
				filesMetaData: [{
					fileName: "Item_Display.js",
					metadata: {
						"__metadata": { type: "SP.Data.OData__x005f_catalogs_x002f_masterpageItem" },
						Title: "SPSave Display Template",
						DisplayTemplateLevel: "Item",
						TargetControlType: {
							"__metadata": {
								"type": "Collection(Edm.String)"
							},
							"results": [
								"SearchResults"
							]
						},
						ManagedPropertyMapping: `'Title':'Title','Path':'Path','Description':'Description'`,
						ContentTypeId: "0x0101002039C03B61C64EC4A04F5361F38510660500A0383064C59087438E649B7323C95AF6",
						TemplateHidden: false
					}
				}]
			}, creds));
	});
```  
...and any other scenarios you need.

For list of all options for the `spsave` refer to the [git hub repository](https://github.com/s-KaiNet/spsave).  

## Integration testing:
1. Rename file `/test/integration/config.sample.js` to `config.js`.
2. Update information in `config.js` with appropriate values (urls, credentials, environment).
3. Run `npm run test-int`.

Known Issues
--

When heavily utilizing watchers along with `gulp-spsave` you may see errors "Save conflict" or "Cobalt error". [spsave](https://github.com/s-KaiNet/spsave) tries to recover from this errors by trying to re-upload file one or two more times again. But usually it's a good idea to use [gulp-plumber](https://github.com/floatdrop/gulp-plumber) or similar tool in order to make sure that your watchers will not be broken when errors occur.   
Normally you can do the following in your `gulpfile.js`:   

```javascript 
var plumber = require("gulp-plumber");
var onError = function (err) {
	console.log(err);
	this.emit("end");
};
gulp.watch(["App/index.html"], function (event) {
		return gulp.src(event.path, { base: "App" })
			.pipe(plumber({
				errorHandler: onError
			}))
			.pipe(spsave(settings));
	});

```

In case of error you watch will be up and running regardless the error. 