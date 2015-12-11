"use strict"
gulp = require("gulp")
path = require("path")
util = require("util")
gutil = require("gulp-util")
merge = require("merge-stream")
changed = require("gulp-changed")
rename = require("gulp-rename")
pkg = require("./package.json")
chalk = require("chalk")
fs = require("fs")

# bump && tag
require "./bumpTag.js"

# CONFIG
#
src =
  cwd: "src"
  dist: "dist"
  scripts: "*/*.js"
  styles: "*/*.css"
  index: "*.js"
  templates: "*/*.tpl.html"

docs =
  cwd: "docs"
  tmp: ".tmp"
  dist: "pages"
  index: "index.html"
  views: "views/**/*.html"
  scripts: "scripts/**/*.js"
  images: "images/{,*/}*.{jpg,png,svg}"
  styles: "styles/*.less"

ports =
  docs: 9090
  pages: 9090

banner = gutil.template("/**\n" + " * <%= pkg.name %>\n" + " * @version v<%= pkg.version %> - <%= today %>\n" + " * @link <%= pkg.homepage %>\n" + " * @author <%= pkg.author.name %> (<%= pkg.author.email %>)\n" + " * @license MIT License, http://www.opensource.org/licenses/MIT\n" + " */\n",
  file: ""
  pkg: pkg
  today: new Date().toISOString().substr(0, 10)
)

# CLEAN
#
clean = require("gulp-clean")
gulp.task "clean:tmp", ->
  gulp.src([".tmp/*"],
    read: false
  ).pipe clean()

gulp.task "clean:test", ->
  gulp.src([
    "test/.tmp/*"
    "test/coverage/*"
  ],
    read: false
  ).pipe clean()

gulp.task "clean:dist", ->
  gulp.src([src.dist + "/*"],
    read: false
  ).pipe clean()

gulp.task "clean:pages", ->
  gulp.src([
    docs.dist + "/*"
    "!" + docs.dist + "/1.0"
    "!" + docs.dist + "/static"
    "!" + docs.dist + "/dist"
    "!" + docs.dist + "/.git"
  ],
    read: false
  ).pipe clean()


# CONNECT
#
connect = require("gulp-connect")
gulp.task "connect:docs", ->
  connect.server
    root: [
      ".tmp"
      ".dev"
      docs.cwd
      src.cwd
    ]
    port: ports.docs
    livereload: true

  return

gulp.task "connect:pages", ->
  connect.server
    root: [docs.dist]
    port: ports.pages

  return

chrome = require("gulp-open")
gulp.task "open:docs", ->
  gulp.src(docs.index,
    cwd: docs.cwd
  ).pipe chrome("",
    url: "http://localhost:" + ports.docs
  )
  return

gulp.task "open:pages", ->
  gulp.src(docs.index,
    cwd: docs.dist
  ).pipe chrome("",
    url: "http://localhost:" + ports.pages
  )
  return


# WATCH
#
watch = require("gulp-watch")
gulp.task "watch:docs", ->
  watch(glob: path.join(docs.cwd, docs.scripts)).pipe connect.reload()
  watch
    glob: path.join(docs.cwd, "styles/**/*.less")
  , ["styles:docs"]
  watch(glob: [
    path.join(docs.cwd, docs.index)
    path.join(docs.cwd, docs.views)
  ]).pipe connect.reload()
  return

gulp.task "watch:dev", ->
  watch(glob: [
    path.join(src.cwd, src.index)
    path.join(src.cwd, src.scripts)
  ]).pipe connect.reload()
  return

gulp.task "watch:pages", ->
  watch
    glob: [
      path.join(src.cwd, src.templates)
      path.join(src.cwd, src.styles)
      path.join(src.cwd, src.scripts)
    ]
  , [
    "pages"
    "dist"
  ]
  return


# SCRIPTS
#
uglify = require("gulp-uglify")
ngmin = require("gulp-ngmin")
concat = require("gulp-concat-util")
sourcemaps = require("gulp-sourcemaps")
gulp.task "scripts:dist", (foo) ->

  # Build unified package
  merged = merge(gulp.src([
    src.index
    src.scripts
  ],
    cwd: src.cwd
  ).pipe(sourcemaps.init()).pipe(ngmin()).pipe(concat(pkg.name + ".js",
    process: (src) ->
      "// Source: " + path.basename(@path) + "\n" + (src.trim() + "\n").replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, "$1")
  )).pipe(concat.header("(function(window, document, undefined) {\n'use strict';\n")).pipe(concat.footer("\n})(window, document);\n")).pipe(concat.header(banner)).pipe(gulp.dest(src.dist)).pipe(rename((path) ->
    path.extname = ".min.js"
    return

  # Build individual modules
  # flatten
  )).pipe(uglify()).pipe(concat.header(banner)).pipe(sourcemaps.write("./")).pipe(gulp.dest(src.dist)), gulp.src(src.scripts,
    cwd: src.cwd
  ).pipe(sourcemaps.init()).pipe(ngmin()).pipe(rename((path) ->
    path.dirname = ""
    return
  )).pipe(concat.header(banner)).pipe(gulp.dest(path.join(src.dist, "modules"))).pipe(rename((path) ->
    path.extname = ".min.js"
    return
  )).pipe(uglify()).pipe(concat.header(banner)).pipe(sourcemaps.write("./")).pipe(gulp.dest(path.join(src.dist, "modules"))))
  merged.on "error", (err) ->
    gutil.log chalk.red(util.format("Plugin error: %s", err.message))
    return

  merged

gulp.task "scripts:pages", (foo) ->

  # Build unified package
  merged = merge(gulp.src([
    src.index
    src.scripts
  ],
    cwd: src.cwd
  ).pipe(sourcemaps.init()).pipe(ngmin()).pipe(concat(pkg.name + ".js",
    process: (src) ->
      "// Source: " + path.basename(@path) + "\n" + (src.trim() + "\n").replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, "$1")
  )).pipe(concat.header("(function(window, document, undefined) {\n'use strict';\n")).pipe(concat.footer("\n})(window, document);\n")).pipe(concat.header(banner)).pipe(gulp.dest(path.join(docs.dist, "scripts"))).pipe(rename((path) ->
    path.extname = ".min.js"
    return
  )).pipe(uglify()).pipe(concat.header(banner)).pipe(sourcemaps.write("./")).pipe(gulp.dest(path.join(docs.dist, "scripts"))))
  merged.on "error", (err) ->
    gutil.log chalk.red(util.format("Plugin error: %s", err.message))
    return

  merged


# TEMPLATES
#
ngtemplate = require("gulp-ngtemplate")
uglify = require("gulp-uglify")
ngmin = require("gulp-ngmin")
createModuleName = (src) ->
  pkg.name + "." + src.split(path.sep)[0]

gulp.task "templates:dist", ->

  # Build unified package
  merged = merge(gulp.src(src.templates,
    cwd: src.cwd
  ).pipe(htmlmin(
    removeComments: true
    collapseWhitespace: true
  )).pipe(ngtemplate(module: createModuleName)).pipe(ngmin()).pipe(concat(pkg.name + ".tpl.js",
    process: (src) ->
      "// Source: " + path.basename(@path) + "\n" + (src.trim() + "\n").replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, "$1")
  )).pipe(concat.header("(function(window, document, undefined) {\n'use strict';\n\n")).pipe(concat.footer("\n\n})(window, document);\n")).pipe(concat.header(banner)).pipe(gulp.dest(src.dist)).pipe(rename((path) ->
    path.extname = ".min.js"
    return

  # Build individual modules
  # flatten
  )).pipe(uglify()).pipe(concat.header(banner)).pipe(gulp.dest(src.dist)), gulp.src(src.templates,
    cwd: src.cwd
  ).pipe(htmlmin(
    removeComments: true
    collapseWhitespace: true
  )).pipe(ngtemplate(module: createModuleName)).pipe(ngmin()).pipe(rename((path) ->
    path.dirname = ""
    return
  )).pipe(concat.header(banner)).pipe(gulp.dest(path.join(src.dist, "modules"))).pipe(rename((path) ->
    path.extname = ".min.js"
    return
  )).pipe(uglify()).pipe(concat.header(banner)).pipe(gulp.dest(path.join(src.dist, "modules"))))
  merged.on "error", (err) ->
    ppgutil.log chalk.red(util.format("Plugin error: %s", err.message))
    return

  merged

gulp.task "templates:pages", ->

  # Build docs partials
  merged = merge(gulp.src([
    "views/sidebar.html"
    "views/partials/*.html"
  ],
    cwd: docs.cwd
    base: docs.cwd
  ).pipe(htmlmin(
    removeComments: true
    collapseWhitespace: true
  )).pipe(ngtemplate(module: pkg.name + "Docs")).pipe(ngmin()).pipe(concat("docs.tpl.js",
    process: (src) ->
      "// Source: " + path.basename(@path) + "\n" + (src.trim() + "\n").replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, "$1")
  )).pipe(concat.header("(function(window, document, undefined) {\n'use strict';\n\n")).pipe(concat.footer("\n\n})(window, document);\n")).pipe(gulp.dest(path.join(docs.dist, "scripts"))).pipe(rename((path) ->
    path.extname = ".min.js"
    return

  # Build demo partials
  )).pipe(uglify()).pipe(concat.header(banner)).pipe(gulp.dest(path.join(docs.dist, "scripts"))), gulp.src("*/docs/*.tpl.demo.html",
    cwd: src.cwd
  ).pipe(htmlmin(
    removeComments: true
    collapseWhitespace: true
  )).pipe(ngtemplate(module: pkg.name + "Docs")).pipe(ngmin()).pipe(concat("demo.tpl.js",
    process: (src) ->
      "// Source: " + path.basename(@path) + "\n" + (src.trim() + "\n").replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, "$1")
  )).pipe(concat.header("(function(window, document, undefined) {\n'use strict';\n\n")).pipe(concat.footer("\n\n})(window, document);\n")).pipe(concat.header(banner)).pipe(gulp.dest(path.join(docs.dist, "scripts"))).pipe(rename((path) ->
    path.extname = ".min.js"
    return

  # Build unified package
  )).pipe(uglify()).pipe(concat.header(banner)).pipe(gulp.dest(path.join(docs.dist, "scripts"))), gulp.src(src.templates,
    cwd: src.cwd
  ).pipe(htmlmin(
    removeComments: true
    collapseWhitespace: true
  )).pipe(ngtemplate(module: createModuleName)).pipe(ngmin()).pipe(concat(pkg.name + ".tpl.js",
    process: (src) ->
      "// Source: " + path.basename(@path) + "\n" + (src.trim() + "\n").replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, "$1")
  )).pipe(concat.header("(function(window, document, undefined) {\n'use strict';\n\n")).pipe(concat.footer("\n\n})(window, document);\n")).pipe(concat.header(banner)).pipe(gulp.dest(path.join(docs.dist, "scripts"))).pipe(rename((path) ->
    path.extname = ".min.js"
    return
  )).pipe(uglify()).pipe(concat.header(banner)).pipe(gulp.dest(path.join(docs.dist, "scripts"))))
  merged.on "error", (err) ->
    gutil.log chalk.red(util.format("Plugin error: %s", err.message))
    return

  merged

gulp.task "templates:test", ->

  # Build individual modules
  # flatten
  gulp.src(src.templates,
    cwd: src.cwd
  ).pipe(htmlmin(
    removeComments: true
    collapseWhitespace: true
  )).pipe(ngtemplate(module: createModuleName)).pipe(ngmin()).pipe(rename((path) ->
    path.dirname = ""
    return
  )).pipe(concat.header(banner)).pipe gulp.dest("test/.tmp/templates")


# STYLES
#
prefix = require("gulp-autoprefixer")
less = require("gulp-less")
safeLess = merge(less())
minifyCss = require("gulp-minify-css")
safeLess.on "error", (err) ->
  gutil.log chalk.red(util.format("Plugin error: %s", err.message))
  return

gulp.task "styles:dist", ->

  # Build unified package
  gulp.src([src.styles],
    cwd: src.cwd
  ).pipe(concat(pkg.name + ".css",
    process: (src) ->
      "/* Source: " + path.basename(@path) + "*/\n" + (src.trim() + "\n")
  )).pipe(concat.header(banner)).pipe(gulp.dest(src.dist)).pipe(rename((path) ->
    path.extname = ".min.css"
    return
  )).pipe(minifyCss()).pipe(concat.header(banner)).pipe gulp.dest(src.dist)

gulp.task "styles:docs", ->
  gulp.src(docs.styles,
    cwd: docs.cwd
    base: docs.cwd
  ).pipe(changed(".tmp/styles")).pipe(less()).pipe(prefix("last 1 version")).pipe(gulp.dest(docs.tmp)).pipe connect.reload()

gulp.task "styles:pages", ->
  merge gulp.src(docs.styles,
    cwd: docs.cwd
    base: docs.cwd
  ).pipe(safeLess).pipe(prefix("last 1 version", "> 1%", "ie 8")).pipe(concat.header(banner)).pipe(gulp.dest(docs.dist)), gulp.src([src.styles],
    cwd: src.cwd
  ).pipe(concat(pkg.name + ".css",
    process: (src) ->
      "/* Source: " + path.basename(@path) + "*/\n" + (src.trim() + "\n")
  )).pipe(concat.header(banner)).pipe(gulp.dest(path.join(docs.dist, "styles"))).pipe(rename((path) ->
    path.extname = ".min.css"
    return
  )).pipe(minifyCss()).pipe(concat.header(banner)).pipe(gulp.dest(path.join(docs.dist, "styles")))


# VIEWS
#
htmlmin = require("gulp-htmlmin")
usemin = require("gulp-usemin")
nginclude = require("gulp-nginclude")
cleancss = require("gulp-cleancss")
gulp.task "views:pages", ->

  # Build views
  # gulp.src(docs.views, {cwd: docs.cwd})
  #   .pipe(htmlmin({collapseWhitespace: true}))
  #   .pipe(gulp.dest(docs.dist)),

  # Build index
  # supeseeded by scripts:pages & templates:pages
  merged = merge(gulp.src(docs.index,
    cwd: docs.cwd
  ).pipe(nginclude(assetsDirs: [src.cwd])).pipe(usemin(
    js: [
      ngmin()
      uglify()
      concat.header(banner)
    ]
    lib: ["concat"]
    css: [
      cleancss()
      concat.header(banner)
    ]
  )).pipe(gulp.dest(docs.dist)))
  merged.on "error", (err) ->
    gutil.log chalk.red(util.format("Plugin error: %s", err.message))
    return

  merged


# TEST
#
jshint = require("gulp-jshint")
stylish = require("jshint-stylish")
gulp.task "jshint", ->
  gulp.src(src.scripts,
    cwd: src.cwd
  ).pipe(changed(src.scripts)).pipe(jshint()).pipe jshint.reporter(stylish)
  return

karma = require("karma").server
coveralls = require("gulp-coveralls")
gulp.task "karma:unit", ["templates:test"], ->
  karma.start
    configFile: path.join(__dirname, "test/karma.conf.js")
    browsers: ["PhantomJS"]
    reporters: ["dots"]
    singleRun: true
  , (code) ->
    gutil.log "Karma has exited with " + code
    process.exit code
    return

  return

gulp.task "karma:server", ["templates:test"], ->
  karma.start
    configFile: path.join(__dirname, "test/karma.conf.js")
    browsers: ["PhantomJS"]
    reporters: ["progress"]
    autoWatch: true
  , (code) ->
    gutil.log "Karma has exited with " + code
    process.exit code
    return

  return


# codeclimate-test-reporter
gulp.task "karma:travis", ["templates:test"], ->
  karma.start
    configFile: path.join(__dirname, "test/karma.conf.js")
    browsers: ["PhantomJS"]
    reporters: [
      "dots"
      "coverage"
    ]
    singleRun: true
  , (code) ->
    gutil.log "Karma has exited with " + code
    gulp.src("test/coverage/**/lcov.info").pipe(coveralls()).on "end", ->
      process.exit code
      return

    return

  return


# COPY
#
gulp.task "copy:pages", ->
  gulp.src([
    "favicon.ico"
    docs.images
  ],
    cwd: docs.cwd
    base: docs.cwd
  ).pipe gulp.dest(docs.dist)
  return


# DEFAULT
#
runSequence = require("run-sequence")
gulp.task "default", ["dist"]
gulp.task "build", ["dist"]
gulp.task "test", ->
  runSequence "clean:test", "templates:test", [
    "jshint"
    "karma:unit"
  ]
  return

gulp.task "test:server", ->
  runSequence "clean:test", "templates:test", "karma:server"
  return

gulp.task "dist", (callback)->
  runSequence "clean:dist", [
    "templates:dist"
    "scripts:dist"
    "styles:dist"
  ], callback
  return

gulp.task "pages", ->
  runSequence "clean:pages", "styles:docs", "views:pages", [
    "templates:pages"
    "scripts:pages"
    "styles:pages"
    "copy:pages"
  ]
  return

gulp.task "serve", ->
  runSequence "clean:tmp", [ # , 'watch:dev'
    "styles:docs"
    "connect:docs"
  ], [
    "open:docs"
    "watch:docs"
  ]
  return

gulp.task "serve:pages", [
  "connect:pages"
  "open:pages"
]
