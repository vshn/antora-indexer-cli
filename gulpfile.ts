import gulp from 'gulp'
import ts from 'gulp-typescript'
import uglify from 'gulp-uglify'

const tsProject = ts.createProject('tsconfig.json');

gulp.task('default', function () {
  return tsProject.src()
      .pipe(tsProject())
      .pipe(uglify())
      .pipe(gulp.dest('dist'))
})
