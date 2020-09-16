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
const imagemin = require("gulp-imagemin");
const imageminOptipng = require("imagemin-optipng");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminSvgo = require("imagemin-svgo");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const htmlmin = require("gulp-htmlmin");

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
      baseDir: 'build'
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
gulp.watch("source/*.html").on("change", () => {htmlMinify(); sync.reload()});
}

// Copy Files

const copy = () => {
  return gulp.src([
      "source/fonts/**/*.{woff,woff2}",
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

//Images Optimization

const images = () => {
    return gulp.src("source/img/**/*.{jpg,png,svg}")
        .pipe(imagemin([
            imageminOptipng({optimizationLevel: 3}),
            imageminJpegtran({progressive: true}),
            imageminSvgo()
        ]))
        .pipe(gulp.dest("build/img"));
}

exports.images = images;

//Create WebP

const createWebp = () => {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"))
}

exports.webp = createWebp;

//Create Sprite

const sprite = () => {
  return gulp.src("build/img/**/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))

}

exports.sprite = sprite;

//HTML Minify

const htmlMinify = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build"))
}

exports.htmlMinify = htmlMinify;

//New Run Build

const build = gulp.series(
    clean,
    copy,
    styles,
    images,
    createWebp,
    sprite,
    htmlMinify
);

exports.build = build;

exports.default = gulp.series(
  build, server, watcher
);
