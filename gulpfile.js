const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const del = require("del");


// Styles

const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("styles.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'source'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

exports.default = gulp.series(
  styles, server, watcher
);

// Copy Files

const copy = () => {
  return gulp.src([
      "source/fonts/**/*.{woff, woff2}",
      "source/img/**",
      "source/js/**",
      "source/*.ico"
  ], {
      base: "source"
  })
  .pipe(gulp.dest("build"));
};

exports.copy = copy;

//Clear Folder

const clean = () => {
    return del("build");
};

exports.clean = clean;

//New Run Build

const build = gulp.series(
    clean,
    copy
);

exports.build = build;

//Images Optimization

const imagemin = require("gulp-imagemin");
const imageminOptipng = require("imagemin-optipng");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminSvgo = require("imagemin-svgo");

const images = () => {
    return gulp.src("source/img/**/*.{jpg, png, svg}")
        .pipe(imagemin([
            imageminOptipng({optimizationLevel: 3}),
            imageminJpegtran({progressive: true}),
            imageminSvgo()
       ]))
}

exports.images = images;
