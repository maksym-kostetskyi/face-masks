// Підключення основних модулів
const { src, dest, watch, series, parallel } = require("gulp");

// Підключення плагінів
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cleanCSS = require("gulp-clean-css");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const fileInclude = require("gulp-file-include");
const htmlmin = require("gulp-htmlmin");
const browserSync = require("browser-sync").create();
const imagePaths = {
  src: "src/assets/images/**/*.*",
  dest: "dist/assets/images/",
};

//завдання для копіювання зображень
function images() {
  return src("src/assets/images/**/*.{jpg,jpeg,png,gif,svg}", {
    encoding: false,
  }).pipe(dest("dist/assets/images/"));
}

// Шляхи до файлів
const paths = {
  html: {
    src: "src/html/*.html",
    watch: "src/html/**/*.html",
    dest: "dist/",
  },
  scss: {
    src: "src/scss/main.scss",
    watch: "src/scss/**/*.scss",
    dest: "dist/css/",
  },
  js: {
    src: "src/js/**/*.js",
    watch: "src/js/**/*.js",
    dest: "dist/js/",
  },
};

// Завдання для очищення папки dist
async function clean() {
  const { deleteAsync } = await import("del");
  return deleteAsync(["dist"]);
}

// Завдання для обробки HTML
function html() {
  return src(paths.html.src)
    .pipe(
      fileInclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream());
}

// Завдання для обробки SCSS
function scss() {
  return src(paths.scss.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(cleanCSS())
    .pipe(dest(paths.scss.dest))
    .pipe(browserSync.stream());
}

// Завдання для обробки JavaScript
function js() {
  return src(paths.js.src)
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest(paths.js.dest))
    .pipe(browserSync.stream());
}

// Завдання для відстеження змін у файлах
function watchFiles() {
  browserSync.init({
    server: {
      baseDir: "./dist",
    },
  });
  watch(paths.scss.watch, scss);
  watch(paths.js.watch, js);
  watch(paths.html.watch, html);
  watch(imagePaths.src, images);
}

// Побудова проєкту для продакшену
const build = series(clean, parallel(html, scss, js, images));

// Завдання за замовчуванням (для розробки)
const dev = series(build, watchFiles);

// Експорт завдань для виклику з командного рядка
exports.clean = clean;
exports.html = html;
exports.scss = scss;
exports.js = js;
exports.images = images;
exports.build = build;
exports.default = dev;
