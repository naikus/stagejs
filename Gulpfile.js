var gulp = require("gulp"),
    del = require("del"),
    jshint = require("gulp-jshint"),
    concat = require("gulp-concat"),
    // uglify = require("gulp-uglify"),
    terser = require("gulp-terser"),
    less = require("gulp-less"),
    mergestream = require("merge-stream"),
    connect = require("gulp-connect"),
    errorHandler = name => e => {
      console.error(name + ": " + e.toString());
      console.log(e);
    };


var config = {
  src_dir: "src",
  dist: {
    dir: "dist",
    css_dir: "dist/css"
  }
};

gulp.task("default", function(cb) {
  console.log("Available tasks:");
  console.log([
    "------------------------------------------------------------------------",
    "build           Build stage in the dist directory",
    "clean           Clean the dest directory",
    "-------------------------------------------------------------------------"
  ].join("\n"));
  cb();
});


gulp.task("clean", function(cb) {
  del([
    config.dist.dir
  ], cb);
});


gulp.task("jshint", function() {
  return gulp.src([config.src_dir + "/**/*.js"])
      .pipe(jshint())
      .pipe(jshint.reporter("default"));
});


gulp.task("lessc", function() {
  return gulp.src(config.src_dir + "/**/*.less")
      .pipe(less())
      .pipe(gulp.dest(config.dist.dir));
});


gulp.task("build-lib", gulp.parallel("jshint", "lessc", function() {
   // do other build things
   // gulp.start("jshint");
   // gulp.start("lessc");

   return mergestream(
      gulp.src(["src/stage.js"]/*, {debug: true}*/)
            .pipe(concat("stage.js"))
            .pipe(gulp.dest(config.dist.dir))
            .pipe(concat("stage.min.js"))
            .pipe(gulp.dest(config.dist.dir))
            .pipe(terser({
              ie8: true
            })).on("error", errorHandler("Terser"))
            .pipe(gulp.dest(config.dist.dir)),

      gulp.src(["src/stage.less"])
            .pipe(concat("stage.less"))
            .pipe(gulp.dest(config.dist.dir))
   );
}));


gulp.task("build", gulp.series("build-lib", function() {
  var dist = config.dist.dir;
  return mergestream(
    gulp.src([
      dist + "/*.css",
      dist + "/*.less"
    ]).pipe(gulp.dest("example/css")),

    gulp.src([
      dist + "/*.js"
    ]).pipe(gulp.dest("example/js")),
  );
  // return gulp.src(config.dist.dir + "/**/*.*").pipe(gulp.dest("example"));
}));


gulp.task("example", gulp.series("build", function() {
  connect.server({
    root: "example",
    host: "0.0.0.0",
    post: 8080
  });
}));
