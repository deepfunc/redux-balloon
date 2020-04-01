// import { runSaga, stdChannel } from 'redux-saga';
// import EventEmitter from 'events';
// import {
//   addSagaModule,
//   delSagaModule,
//   runSagaModules
// } from '../src/sagaModules_backup';
//
// describe('sagaModules', () => {
//   test('[model.sagas] could be undefined', () => {
//     const model = { namespace: 'hello' };
//     expect(addSagaModule(model, {})).toEqual({});
//   });
//
//   test('should add sagas module', () => {
//     let model = {
//       namespace: 'hello',
//       sagas: () => {
//         return function* () {
//           yield 'hello, sagas';
//         };
//       }
//     };
//     expect(addSagaModule(model, {})).toEqual({
//       hello: [expect.any(Function)]
//     });
//   });
//
//   test('should delete sagas module', () => {
//     const model = {
//       namespace: 'hello',
//       sagas: () => {
//         return function* () {
//           yield 'hello, sagas';
//         };
//       }
//     };
//     let sagaModules = addSagaModule(model, {});
//     sagaModules = delSagaModule('hello');
//     expect(sagaModules).toEqual({});
//   });
//
//   describe('run sagas', () => {
//     function createEmitter() {
//       const emitter = new EventEmitter();
//       const channel = stdChannel();
//       emitter.on('action', channel.put);
//
//       return {
//         channel,
//
//         emit(action) {
//           emitter.emit('action', action);
//         }
//       };
//     }
//
//     test('should run sagas: sagas is function, and return generator function', () => {
//       const dispatched = [];
//       const runSagaMock = (saga) => {
//         return runSaga({
//           dispatch: (action) => dispatched.push(action)
//         }, saga);
//       };
//       const model = {
//         namespace: 'hello',
//         sagas: ({ put }) => {
//           return function* () {
//             yield put({ type: 'HELLO_SAGA' });
//           };
//         }
//       };
//
//       const sagaModules = addSagaModule(model, {});
//       runSagaModules(sagaModules, runSagaMock, {}, {});
//       expect(dispatched).toContainEqual({ type: 'HELLO_SAGA' });
//     });
//
//     test('should run sagas: sagas is plain object', (done) => {
//       const dispatched = [];
//       const { channel, emit } = createEmitter();
//       const runSagaMock = (saga) => {
//         return runSaga({
//           channel,
//           dispatch: (action) => {
//             dispatched.push(action);
//           }
//         }, saga);
//       };
//       const model = {
//         namespace: 'hello',
//         sagas: {
//           * 'SOME_GET'(action, { put }) {
//             yield put({ type: 'SOME_GET_OK' });
//           },
//           'OTHER_GET': [
//             function* (action, { put }) {
//               yield put({ type: 'OTHER_GET_OK' });
//             },
//             { type: 'takeLatest' }
//           ]
//         }
//       };
//
//       const sagaModules = addSagaModule(model, {});
//       runSagaModules(sagaModules, runSagaMock, {}, {});
//       setTimeout(() => {
//         emit({ type: 'SOME_GET' });
//         emit({ type: 'OTHER_GET' });
//       }, 10);
//       setTimeout(
//         () => {
//           expect(dispatched).toEqual(expect.arrayContaining([
//             { type: 'SOME_GET_OK' },
//             { type: 'OTHER_GET_OK' }
//           ]));
//           done();
//         },
//         100
//       );
//     });
//
//     test('should run sagas: sagas is function, and return plain object', (done) => {
//       const dispatched = [];
//       const { channel, emit } = createEmitter();
//       const runSagaMock = (saga) => {
//         return runSaga({
//           channel,
//           dispatch: (action) => {
//             dispatched.push(action);
//           }
//         }, saga);
//       };
//       const model = {
//         namespace: 'hello',
//         sagas: ({ put }) => {
//           return {
//             * 'SOME_GET'(action) {
//               yield put({ type: 'SOME_GET_OK' });
//             },
//             'OTHER_GET': [
//               function* (action) {
//                 yield put({ type: 'OTHER_GET_OK' });
//               },
//               { type: 'takeLatest' }
//             ]
//           };
//         }
//       };
//
//       const sagaModules = addSagaModule(model, {});
//       runSagaModules(sagaModules, runSagaMock, {}, {});
//       setTimeout(() => {
//         emit({ type: 'SOME_GET' });
//         emit({ type: 'OTHER_GET' });
//       }, 10);
//       setTimeout(
//         () => {
//           expect(dispatched).toEqual(expect.arrayContaining([
//             { type: 'SOME_GET_OK' },
//             { type: 'OTHER_GET_OK' }
//           ]));
//           done();
//         },
//         20
//       );
//     });
//   });
// });
