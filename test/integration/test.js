process.env.NODE_ENV = 'development';

var expect = require('chai').expect,
  config = require('./config'),
  sprequest = require('sp-request'),
  gulp = require('gulp'),
  assert = require('stream-assert'),
  spsave = require('./../../index'),
  url = require('url'),
  fs = require('fs');

var tests = [
  {
    name: 'on-premise',
    creds: config.onprem,
    env: config.env,
    url: config.url.onprem
  },
  {
    name: 'online',
    creds: config.online,
    env: {},
    url: config.url.online
  }
];

tests.forEach(function (test) {
  describe(`spsave: integration tests - ${test.name}`, function () {
    var spr = sprequest.create({ username: test.creds.username, password: test.creds.password }, { domain: test.env.domain });

    beforeEach('delete folders', function (done) {
      this.timeout(10 * 1000);

      spr.requestDigest(test.url)
        .then(digest => {
          return Promise.all([spr.post(`${test.url}/_api/web/GetFolderByServerRelativeUrl(@FolderName)` +
            `?@FolderName='${encodeURIComponent('SiteAssets/files')}'`, {
              headers: {
                'X-RequestDigest': digest,
                'X-HTTP-Method': 'DELETE'
              }
            })]);
        })
        .then(data => {
          done();
        })
        .catch(done);
    });

    after('cleaning', function (done) {
      this.timeout(10 * 1000);

      spr.requestDigest(test.url)
        .then(digest => {
          return Promise.all([spr.post(`${test.url}/_api/web/GetFolderByServerRelativeUrl(@FolderName)` +
            `?@FolderName='${encodeURIComponent('SiteAssets/files')}'`, {
              headers: {
                'X-RequestDigest': digest,
                'X-HTTP-Method': 'DELETE'
              }
            })]);
        })
        .then(data => {
          done();
        })
        .catch(done);
    });

    var path = (url.parse(test.url).path).replace(/(\/$)|(\\$)/, '');

    it('should upload file into the folder', function (done) {
      this.timeout(10 * 1000);
      var fileName = 'index.js';
      var fileContent = fs.readFileSync(fileName);
      var folder = 'SiteAssets/files';

      gulp.src(fileName)
        .pipe(spsave({
          siteUrl: test.url,
          username: test.creds.username,
          password: test.creds.password,
          domain: test.env.domain,
          folder: folder
        }))
        .on('finish', function () {
          var fileRelativeUrl = `${path}/${folder}/${fileName}`;

          spr.get(`${test.url}/_api/web/GetFileByServerRelativeUrl(@FileUrl)/$value` +
            `?@FileUrl='${encodeURIComponent(fileRelativeUrl)}'`, {
              encoding: null
            }).then(data => {
              expect(fileContent.equals(data.body)).is.true;
              done();
            })
            .catch(done);
        });
    });

    it('should upload file into the folder with automatic base option', function (done) {
      this.timeout(10 * 1000);

      var fileContent = fs.readFileSync('test/integration/files/spsave.txt');
      var folder = 'SiteAssets/files';

      gulp.src('test/integration/files/*.*', { base: 'test' })
        .pipe(spsave({
          siteUrl: test.url,
          username: test.creds.username,
          password: test.creds.password,
          domain: test.env.domain,
          folder: folder,
          flatten: false
        }))
        .on('finish', function () {
          var fileRelativeUrl = `${path}/${folder}/integration/files/spsave.txt`;

          spr.get(`${test.url}/_api/web/GetFileByServerRelativeUrl(@FileUrl)/$value` +
            `?@FileUrl='${encodeURIComponent(fileRelativeUrl)}'`, {
              encoding: null
            }).then(data => {
              expect(fileContent.equals(data.body)).is.true;
              done();
            })
            .catch(done);
        });
    });
    
    it('should upload file into the folder with base option and flatten', function (done) {
      this.timeout(10 * 1000);

      var fileContent = fs.readFileSync('test/integration/files/spsave.txt');
      var folder = 'SiteAssets/files';

      gulp.src('test/integration/files/*.*', { base: 'test' })
        .pipe(spsave({
          siteUrl: test.url,
          username: test.creds.username,
          password: test.creds.password,
          domain: test.env.domain,
          folder: folder,
          flatten: true
        }))
        .on('finish', function () {
          var fileRelativeUrl = `${path}/${folder}/spsave.txt`;

          spr.get(`${test.url}/_api/web/GetFileByServerRelativeUrl(@FileUrl)/$value` +
            `?@FileUrl='${encodeURIComponent(fileRelativeUrl)}'`, {
              encoding: null
            }).then(data => {
              expect(fileContent.equals(data.body)).is.true;
              done();
            })
            .catch(done);
        });
    });
    
    it('should not throw an error when processing file further in pipes', function (done) {
      this.timeout(10 * 1000);

      var fileContent = fs.readFileSync('test/integration/files/spsave.txt');
      var folder = 'SiteAssets/files';

      gulp.src('test/integration/files/*.*', { base: 'test' })
        .pipe(spsave({
          siteUrl: test.url,
          username: test.creds.username,
          password: test.creds.password,
          domain: test.env.domain,
          folder: folder,
          flatten: true
        }))
        .pipe(gulp.dest('./test'))
        .on('finish', function () {
          done();
        });
    });
  });
});

