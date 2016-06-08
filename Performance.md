## Performance: `gulp-spsave` vs `gulp-spsync`

Tested using 50 file uploads with `gulp-spsave` and `gulp-spsync`, all for SharePoint Online, because `gulp-spsync` doesn't support on-premise.  
Code you can find under `test/performance/test.js`.   

To run it on your environment rename `config.sample.js` to `config.js`, update config values, put random files under `test/performance/files/SiteAssets` and run `npm run test-perf`.  

Here is the test results for `gulp-spsave@2.0.1` (`spsave@2.0.2`) and `gulp-spsync@1.5`. Test run for 50 files 10 times and this values are average values from this 10 runs:

```
50 file uploads test
---------------------------------
library      total time  per file
-----------  ----------  --------
gulp-spsave  36.103s     0.72206
gulp-spsync  48.165s     0.96330
```


You see, `gulp-spsave` is faster by 20-30%, because of multiple performance improvements comparing to 1.x version.