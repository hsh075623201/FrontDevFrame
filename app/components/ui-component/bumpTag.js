var gulp = require('gulp'),
git = require('gulp-git'),
bump = require('gulp-bump'),
filter = require('gulp-filter'),
map = require('map-stream'),
gutil = require('gulp-util'),
runSequence = require("run-sequence"),
tag_version = function(opts) {
    if(!opts) opts = {}
    if(!opts.key) opts.key = 'version'
    if(!opts.prefix) opts.prefix = 'v'
    if(typeof opts.push === 'undefined') opts.push = true

    function modifyContents(file, cb) {

        if(file.isNull()) return cb(null, file)
        if(file.isStream()) return cb(new Error('gulp-tag-version: streams not supported'))

        var json = JSON.parse(file.contents.toString()),
    	tag = opts.prefix+json[opts.key]

        gutil.log('Tagging as: '+gutil.colors.cyan(tag))
        git.tag(tag, 'tagging as '+tag)
        cb(null, file)
    }

    return map(modifyContents)
};


// config for bump/tag
var paths = {
    scripts       : ['src/*.js'],
    versionToBump : ['./package.json', './bower.json'],
    versionToCheck: 'package.json',
    dest          : './'
}

/**
 * Bumping version number.
 * Please read http://semver.org/
 *
 * You can use the commands
 *
 *     gulp patch     # makes v0.1.0 → v0.1.1
 *     gulp feature   # makes v0.1.1 → v0.2.0
 *     gulp release   # makes v0.2.1 → v1.0.0
 *
 * To bump the version numbers accordingly after you did a patch,
 * introduced a feature or made a backwards-incompatible release.
 */

function inc(importance) {
    var process = gulp.src(paths.versionToBump); // get all the files to bump version in

    process.pipe(bump({type: importance})) // bump the version number in those files
        .pipe(gulp.dest(paths.dest))  // save it back to filesystem
}

function tag(){
    return gulp.src(paths.versionToBump)
        .pipe(filter(paths.versionToCheck)) // read only one file to get the version number
        .pipe(tag_version()) // tag it in the repository
        .pipe(git.push('origin', 'master', { args: '--tags' })) // push the tags to master
}

gulp.task('patch', function() { return inc('patch'); })
gulp.task('minor', function() { return inc('minor'); })
gulp.task('major', function() { return inc('major'); })
gulp.task('tag', function() { return tag(); })
