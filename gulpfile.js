var gulp = require('gulp'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee'),
    browserify = require('gulp-browserify'),
    compass = require('gulp-compass'),
    cssNano = require('gulp-cssnano'),
    connect = require('gulp-connect'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    htmlMin = require('gulp-htmlmin'),
    jsonMin = require('gulp-jsonminify'),
    imageMin = require('gulp-imagemin'),
    pngQuant= require('imagemin-pngquant'),
    concat = require('gulp-concat');

var env,
    coffeeSources,
    jsSources,
    sassSources,
    htmlSources;

env = process.env.NODE_ENV || 'development';

if (env === 'development'){
  outputDir = 'builds/development/';
} else {
  outputDir = 'builds/production/';
}

coffeeSources = 'components/coffee/*.coffee';
jsSources = ['components/scripts/rclick.js', 'components/scripts/pixgrid.js', 'components/scripts/tagline.js', 'components/scripts/template.js'];
sassSources = 'components/sass/style.scss';
htmlSources = outputDir + '*.html';

gulp.task('coffee', function () {
  gulp.src(coffeeSources)
    .pipe(coffee({bare: true})
      .on('error', gutil.log))
    .pipe(gulp.dest('components/scripts'))
});

gulp.task('js', function () {
  gulp.src(jsSources)
    .pipe(concat('script.js'))
    .pipe(browserify())
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulp.dest(outputDir + 'js'))
    .pipe(connect.reload());
});

gulp.task('compass', function () {
  gulp.src(sassSources)
    .pipe(compass({
      sass: 'components/sass'
    }))
    .on('error', gutil.log)
    .pipe(gulpif(env === 'production', cssNano()))
    .pipe(gulp.dest(outputDir + 'css'))
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(coffeeSources, ['coffee']);
  gulp.watch(jsSources, ['js']);
  gulp.watch('components/sass/*.scss', ['compass']);
  gulp.watch('builds/development/*.html', ['html']);
  gulp.watch('builds/development/images/**/*.*', ['images']);
  gulp.watch('builds/development/js/*.json', ['json']);
});

gulp.task('connect', function () {
  connect.server({
    port: 4000,
    root: outputDir,
    livereload: true
  })
});

gulp.task('html', function () {
  gulp.src('builds/development/*.html')
    .pipe(gulpif(env === 'production', htmlMin({
      collapseWhitespace: true
    })))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
    .pipe(connect.reload());
});

gulp.task('json', function () {
  gulp.src('builds/development/js/*.json')
    .pipe(connect.reload())
    .pipe(gulpif(env === 'production', jsonMin()))
    .pipe(gulpif(env === 'production', gulp.dest('builds/production/js')));
});

gulp.task('images', function () {
  gulp.src('builds/development/images/**/*.*')
    .pipe(gulpif(env === 'production', imageMin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [ pngQuant() ]
    })))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
    .pipe(connect.reload());
});

gulp.task('default', ['html', 'json', 'coffee', 'js', 'compass', 'images', 'connect', 'watch']);