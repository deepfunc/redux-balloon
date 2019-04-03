const gulp = require('gulp');
const runSequence = require('run-sequence');
const shell = require('gulp-shell');
const replace = require('gulp-replace');

gulp.task('buildWePY', function (callback) {
  runSequence(
    'buildBabel',
    'replaceSagaReference',
    callback
  );
});

gulp.task('buildBabel', shell.task([
  'cross-env BABEL_ENV=commonjs babel src --out-dir wepy'
]));

gulp.task('replaceSagaReference', function () {
  gulp.src('./wepy/sagaImports.js')
    .pipe(replace('redux-saga', 'redux-saga/dist/redux-saga'))
    .pipe(gulp.dest('./wepy'));
});
