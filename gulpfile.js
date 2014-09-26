'use-script';

var connectLr         = require('connect-livereload'),
    express           = require('express'),
    app               = express(),
    expressPort       = 4000,
    expressRoot       = require('path').resolve('./.tmp'),
    gulp              = require('gulp'),
    liveReloadPort    = 35729,
    lrServer          = require('tiny-lr')(),
    permitIndexReload = true,
    plugins           = require('gulp-load-plugins')(),
    publicDir         = require('path').resolve('./dist'),
    source            = require('vinyl-source-stream'),
    mainBowerFiles    = require('main-bower-files'),
    _                 = require('underscore'),
    watchify          = require('watchify');


function startExpress() {
  app.use(connectLr());
  app.use(express.static(expressRoot));
  app.listen(expressPort);
}

function startLiveReload() {
  lrServer.listen(liveReloadPort, function(err) {
    if (err) {
      return console.log(err);
    }
  });
}

function notifyLivereload(fileName) {
  if (fileName !== 'index.html' || permitIndexReload) {
    lrServer.changed({ body: { files: [fileName] } });

    if (fileName === 'index.html') {
      permitIndexReload = false;
      setTimeout(function() { permitIndexReload = true; }, 5000);
    }
  }
}

function clean(relativePath, cb) {
  plugins.util.log('Cleaning: ' + plugins.util.colors.blue(relativePath));

  gulp
    .src([(publicDir + relativePath), (expressRoot + relativePath)], {read: false})
    .pipe(plugins.rimraf({force: true}))
    .on('end', cb || function() {});
}

function scripts(cb) {
  var bundler = watchify('./src/app/app.js');

  bundler.transform('brfs');

  function rebundle() {
    clean('/app*.js', function() {
      plugins.util.log('Rebuilding application JS bundle');

      return bundler.bundle({ debug: true})
        .pipe(source('app.js'))
        .pipe(plugins.streamify(plugins.rev()))
        .pipe(gulp.dest(expressRoot + '/'))
        .pipe(plugins.streamify(plugins.uglify({ mangle: false })))
        .pipe(plugins.streamify(plugins.size({ showFiles: true })))
        .pipe(gulp.dest(publicDir + '/'))
        .on('end', cb || function() {})
        .on('error', plugins.util.log);
    });

  }
  bundler.on('update', rebundle);
  bundler.on('error', plugins.util.log);
  rebundle();
}

function styles(cb) {
  vendorStyles(function() {
    appStyles(function() {
      cb();
    });
  });
}

function appStyles(cb) {
  clean('/style*.css', function() {
    plugins.util.log('Rebuilding application styles');

    gulp.src('src/style.css')
      .pipe(plugins.plumber())
      .pipe(plugins.streamify(plugins.rev()))
      .pipe(gulp.dest(expressRoot + '/'))
      .pipe(plugins.minifyCss())
      .pipe(plugins.size({ showFiles: true }))
      .pipe(gulp.dest(publicDir + '/'))
      .on('end', cb || function() {})
      .on('error', plugins.util.log);
  });
}

function vendorStyles(cb) {
  clean('/vendor*.css', function() {
    plugins.util.log('Rebuilding vendor styles');

    gulp.src(mainCssBowerFiles(), {base :'src/vendor'})
      .pipe(plugins.concat('vendor.css'))
      .pipe(plugins.plumber())
      .pipe(plugins.streamify(plugins.rev()))
      .pipe(gulp.dest(expressRoot + '/'))
      .pipe(plugins.minifyCss())
      .pipe(plugins.size({ showFiles: true }))
      .pipe(gulp.dest(publicDir + '/'))
      .on('end', cb || function() {})
      .on('error', plugins.util.log);
  });
}

function shims(cb) {
  cb();
}

function mainCssBowerFiles() {
  return _.filter(mainBowerFiles(), function(file) {
    return file.indexOf('.css') !== -1;
  });
}

console.log(mainCssBowerFiles());

function mainJsBowerFiles() {
  return _.filter(mainBowerFiles(), function(file) {
    return file.indexOf('.js') !== -1;
  });
}

function vendor(cb) {
  clean('/vendor*.js', function() {
    plugins.util.log('Rebuilding vendor JS bundle');

    gulp.src(mainJsBowerFiles(), {base: 'src/vendor'})
      .pipe(plugins.concat('vendor.js'))
      .pipe(plugins.streamify(plugins.uglify({ mangle: false })))
      .pipe(plugins.streamify(plugins.rev()))
      .pipe(plugins.size({ showFiles: true }))
      .pipe(gulp.dest(expressRoot + '/'))
      .pipe(gulp.dest(publicDir + '/'))
      .on('end', cb || function() {})
      .on('error', plugins.util.log);
  });
}

function images(cb) {
  clean('/images', function() {
    plugins.util.log('Minifying images');

    gulp.src('app/images/**/*.*')
      .pipe(plugins.imagemin())
      .pipe(plugins.size({ showFiles: true }))
      .pipe(gulp.dest(expressRoot + '/images'))
      .pipe(gulp.dest(publicDir + '/images'))
      .on('end', cb || function() {})
      .on('error', plugins.util.log);
  });
}

function fonts(cb) {
  clean('/styles/fonts/icons', function() {
    plugins.util.log('Copying fonts');

    gulp.src('app/styles/fonts/icons/*.*')
      .pipe(gulp.dest(publicDir + '/styles/fonts/icons'))
      .pipe(gulp.dest(expressRoot + '/styles/fonts/icons'))
      .on('end', cb || function() {})
      .on('error', plugins.util.log);
  });
}

function indexHtml(cb) {
  plugins.util.log('Rebuilding index.html');

  function inject(glob, path, tag) {
    return plugins.inject(
      gulp.src(glob, {
        cwd: path
      }), {
        starttag: '<!-- inject:' + tag + ':{{ext}} -->'
      }
    );
  }

  function buildIndex(path, cb) {
    gulp.src('src/index.html')
      .pipe(inject('./vendor*.css', path, 'vendor-style'))
      .pipe(inject('./style*.css', path, 'app-style'))
      .pipe(inject('./shim*.js', path, 'shim'))
      .pipe(inject('./vendor*.js', path, 'vendor'))
      .pipe(inject('./app*.js', path, 'app'))
      .pipe(inject('./templates*.js', path, 'templates'))
      .pipe(gulp.dest(path))
      .on('end', cb || function() {})
      .on('error', plugins.util.log);
  }

  buildIndex(expressRoot, cb || function(){});
  buildIndex(publicDir, function(){});
}

gulp.task('default', function () {
  startExpress();
  startLiveReload();
  fonts();
  images();
  styles(indexHtml);
  shims(indexHtml);
  vendor(indexHtml);
  scripts(function() {
    indexHtml(function() {
      notifyLivereload('index.html');
    });
  });

  gulp.watch('bower.json', function() {
    vendor(function() {
      indexHtml(function() {
        notifyLivereload('index.html');
      });
    });
  });

  gulp.watch('src/**/**', function() {
    console.log("Noticed App Changes");
    scripts(function() {
      styles(function() {
        indexHtml(function() {
          notifyLivereload('index.html');
        });
      });
    });
  });

  gulp.watch('src/index.html', function() {
    indexHtml(function() {
      notifyLivereload('index.html');
    });
  });
});

process.on('uncaughtException', function(err) {
  console.error("We found an error %s", err);
});
