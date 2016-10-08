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
    name: 'on-premise user credentials',
    creds: config.onpremCreds,
    url: config.onpremNtlmEnabledUrl
  },
  {
    name: 'on-premise addin only',
    creds: config.onpremAddinOnly,
    url: config.onpremAdfsEnabledUrl
  },
  {
    name: 'online user credentials',
    creds: config.onlineCreds,
    url: config.onlineUrl
  },
  {
    name: 'online addin only',
    creds: config.onlineAddinOnly,
    url: config.onlineUrl
  },
  {
    name: 'adfs user credentials',
    creds: config.adfsCredentials,
    url: config.onpremAdfsEnabledUrl
  }
];

tests.forEach(function (test) {
  describe(`spsave: integration tests - ${test.name}`, function () {
    var spr = sprequest.create(test.creds);

    beforeEach('delete folders', function (done) {
      this.timeout(30 * 1000);

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
      this.timeout(30 * 1000);

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
      this.timeout(30 * 1000);
      var fileName = 'index.js';
      var fileContent = fs.readFileSync(fileName);
      var folder = 'SiteAssets/files';

      gulp.src(fileName)
        .pipe(spsave({
          siteUrl: test.url,
          folder: folder
        }, test.creds))
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
      this.timeout(30 * 1000);

      var fileContent = fs.readFileSync('test/integration/files/spsave.txt');
      var folder = 'SiteAssets/files';

      gulp.src('test/integration/files/*.*', { base: 'test' })
        .pipe(spsave({
          siteUrl: test.url,
          folder: folder,
          flatten: false
        }, test.creds))
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
      this.timeout(30 * 1000);

      var fileContent = fs.readFileSync('test/integration/files/spsave.txt');
      var folder = 'SiteAssets/files';

      gulp.src('test/integration/files/*.*', { base: 'test' })
        .pipe(spsave({
          siteUrl: test.url,
          folder: folder,
          flatten: true
        }, test.creds))
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
      this.timeout(30 * 1000);

      var fileContent = fs.readFileSync('test/integration/files/spsave.txt');
      var folder = 'SiteAssets/files';

      gulp.src('test/integration/files/*.*', { base: 'test' })
        .pipe(spsave({
          siteUrl: test.url,
          folder: folder,
          flatten: true
        }, test.creds))
        .pipe(gulp.dest('./test'))
        .on('finish', function () {
          done();
        });
    });

    it('should update metadata', function (done) {
      this.timeout(30 * 1000);
      var fileName = 'index.js';
      var fileContent = fs.readFileSync(fileName);
      var folder = 'SiteAssets/files';
      var title = 'updated by spsave';

      gulp.src(fileName)
        .pipe(spsave({
          siteUrl: test.url,
          folder: folder,
          filesMetaData: [{
            fileName: fileName,
            metadata: {
              '__metadata': { type: 'SP.Data.SiteAssetsItem' },
              Title: title
            }
          }]
        }, test.creds))
        .on('finish', function () {
          var fileRelativeUrl = `${path}/${folder}/${fileName}`;

          spr.get(`${test.url}/_api/web/GetFileByServerRelativeUrl(@FileUrl)` +
            `?@FileUrl='${encodeURIComponent(fileRelativeUrl)}'`).then(data => {
              expect(data.body.d.Title).to.equal(title);
              done();
            })
            .catch(done);
        });
    });
  });
});

