const gulp = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const del = require('del')

//sass.compiler = require('sass')
gulp.task('styles', () => {
    return gulp.src('styles/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('styles/css/'))
})

gulp.task('clean', () => {
    return del([
        'styles/main.css',
    ])
})

gulp.task('watch', () => {
    gulp.watch('styles/sass/**/*.scss', (done) => {
        gulp.series(['clean', 'styles'])(done);
    })
})

gulp.task('build', gulp.series(['clean', 'styles']))
gulp.task('default', gulp.series(['clean', 'styles', 'watch']))