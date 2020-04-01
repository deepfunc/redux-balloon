// import checkModel from '../src/checkModel';
//
// describe('checkModel', () => {
//   test('namespace should be defined', () => {
//     expect(() => checkModel({})).toThrow();
//   });
//
//   test('namespace should be string', () => {
//     expect(() => checkModel({ namespace: 666 })).toThrow();
//   });
//
//   test('namespace should be unique', () => {
//     const existingModels = [{ namespace: 'some' }];
//     expect(() => checkModel({ namespace: 'some' }, existingModels)).toThrow();
//   });
//
//   test('reduces should be plain object', () => {
//     expect(() => checkModel({
//       namespace: 'test',
//       reducers: 123
//     })).toThrow();
//   });
//
//   test('actions should be plain object or function', () => {
//     expect(() => checkModel({
//       namespace: 'test',
//       actions: 123
//     })).toThrow();
//   });
//
//   test('selectors should be function', () => {
//     expect(() => checkModel({
//       namespace: 'test',
//       selectors: {}
//     })).toThrow();
//   });
//
//   test('sagas should be plain object or function', () => {
//     expect(() => checkModel({
//       namespace: 'hello',
//       sagas: {
//         * 'SOME_GET'(action) {
//           yield 'some';
//         }
//       }
//     })).not.toThrow();
//
//     expect(() => checkModel({
//       namespace: 'hello',
//       sagas: () => {
//         return function* () {
//           yield 'hello, sagas';
//         };
//       }
//     })).not.toThrow();
//
//     expect(() => checkModel({
//       namespace: 'hello',
//       sagas: 123
//     })).toThrow();
//   });
// });
