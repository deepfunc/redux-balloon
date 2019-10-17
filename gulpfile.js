const gulp = require('gulp');
const runSequence = require('run-sequence');
const shell = require('gulp-shell');
const replace = require('gulp-replace');

gulp.task('buildWePY', function (callback) {
  runSequence(
    'copySrc',
    'replaceSagaReference',
    'buildBabel',
    callback
  );
});

gulp.task('copySrc', shell.task([
  'cp -r src wepy'
]));

gulp.task('replaceSagaReference', function () {
  gulp.src('./wepy/sagaImports.js')
    .pipe(
      replace(
        'import * as ReduxSaga from \'redux-saga\';',
        'import * as ReduxSaga from \'redux-saga/dist/redux-saga.umd\';'
      )
    )
    .pipe(
      replace(
        'import * as effects from \'redux-saga/effects\';',
        ''
      )
    )
    .pipe(
      replace(
        'const SagaEffects = effects;',
        'const SagaEffects = ReduxSaga.effects;'
      )
    )
    .pipe(gulp.dest('./wepy'));
});

gulp.task('buildBabel', shell.task([
  'cross-env BABEL_ENV=wepy babel wepy --out-dir wepy'
]));
