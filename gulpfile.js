const gulp = require('gulp');
const shell = require('gulp-shell');

gulp.task('clean for build', shell.task([
  'rm -rf types es lib wepy dist tsc'
]));

gulp.task('tsc', shell.task([
  'npx tsc -p tsconfig.json --outDir tsc'
]));

gulp.task('remove types for tsc', shell.task([
  'rm -rf tsc/types'
]));

gulp.task('babel for es', shell.task([
  'npx cross-env BABEL_ENV=esm babel tsc --out-dir es'
]));

gulp.task('babel for lib', shell.task([
  'npx cross-env BABEL_ENV=commonjs babel tsc --out-dir lib'
]));

gulp.task('copy for wepy', shell.task([
  'cp -r tsc wepy'
]));

/*gulp.task('replaceSagaReference for wepy', function () {
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
});*/

gulp.task('babel for wepy', shell.task([
  'npx cross-env BABEL_ENV=wepy babel wepy --out-dir wepy'
]));

gulp.task('remove tsc', shell.task([
  'rm -rf tsc'
]));

const build = gulp.series(
  'clean for build',
  'tsc',
  'remove types for tsc',
  gulp.parallel(
    'babel for es',
    'babel for lib',
    // gulp.series('copy for wepy', 'replaceSagaReference for wepy')
  ),
  'remove tsc'
);

module.exports = {
  build
};

// "build:umd": "cross-env BABEL_ENV=umd rollup -c && es-check es5 dist/redux-balloon.min.js",
