var gulp = require('gulp'),
  spsave = require('../../index'),
  spsync = require('gulp-spsync'),
  fs = require('fs'),
  config = require('./config').data;

require('console.table');

var filesCount = fs.readdirSync("test/performance/files/SiteAssets").length;

var start = new Date().getTime();
gulp.src('test/performance/files/**/*.*')
  .pipe(spsave({
    username: config.username,
    password: config.password,
    folder: 'SiteAssets',
    siteUrl: config.url,
    flatten: true
  }))
  .pipe(gulp.dest('test/performance/output'))
  .on('finish', function () {

    var spsaveElapsed = new Date().getTime() - start;
    start = new Date().getTime();
    gulp.src('test/performance/files/**/*.*')
      .pipe(spsync({
        'client_id': config.clientId,
        'client_secret': config.clientSecret,
        'realm': '',
        'site': config.url,
        'verbose': false
      }))
      .pipe(gulp.dest('test/performance/output'))
      .on('finish', function () {
        var spsyncElapsed = new Date().getTime() - start;

        console.log('');
        console.log('');
        console.table(`${filesCount} file uploads test`, [
          {
            'library': 'gulp-spsave',
            'total time': `${spsaveElapsed / 1000}s`,
            'per file': `${spsaveElapsed / 1000 / filesCount}`
          },
          {
            'library': 'gulp-spsync',
            'total time': `${spsyncElapsed / 1000}s`,
            'per file': `${spsyncElapsed / 1000 / filesCount}`
          }
        ]);
      });
  });
