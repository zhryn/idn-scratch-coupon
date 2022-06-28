const del = require('del'),
    browserSync = require('browser-sync').create(),
    { task, series, parallel, src, dest, watch } = require('gulp'),
    pug = require('gulp-pug'),
    data = require('gulp-data'),
    fs = require('fs');

const COMPILE_FOLDER = './dist';
const SRC_FOLDER = './src';
const SOURCES_FOLDER = [
    './src/**/*.pug',
    '!./src/layouts/**/*.pug',
    '!./src/components/**/*.pug',
    '!./src/mixins/**/*.pug'
];

const clean = () => del(COMPILE_FOLDER, { force: true });
const build = () => src(SOURCES_FOLDER)
    .pipe(data(function () {
        return JSON.parse(fs.readFileSync('./configurations.json'))
    }))
    .pipe(pug({ basedir: SRC_FOLDER}))
    .pipe(dest(COMPILE_FOLDER))
    .pipe(browserSync.stream());

const startServer = () => browserSync.init({
    server: {
        baseDir: `${COMPILE_FOLDER}`
    }
});


const watchConfigurations = () => watch('./configurations.json', build)
const watchViews = () => watch(`${SRC_FOLDER}/**/*.pug`, build)
const watches = parallel(watchConfigurations, watchViews)

task('build', series(clean, build));
task('serve', series(clean, build, startServer));
task('default', series(clean, build, parallel(startServer, watches)));
