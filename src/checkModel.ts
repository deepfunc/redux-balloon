import invariant from 'invariant';
import { Model } from './types/model';
import { any, isFunction, isPlainObject } from './utils';

export default function checkModel(
  model: Model<any, any>,
  existingModels: Array<Model<any, any>> = []
): void {
  const {
    namespace,
    reducers,
    actions,
    selectors,
    sagas
  } = model;

  // check namespace
  invariant(
    namespace,
    '[model.namespace] should be defined'
  );
  invariant(
    typeof namespace === 'string',
    `[model.namespace] should be string, but got ${typeof namespace}`
  );
  invariant(
    !any(model => model.namespace === namespace, existingModels),
    '[model.namespace] should be unique!'
  );

  // check reducers
  invariant(
    typeof reducers === 'undefined' || isPlainObject(reducers),
    `[model.reducers] should be undefined or plain object, but got ${typeof reducers}`
  );

  // check actions
  invariant(
    typeof actions === 'undefined'
    || isPlainObject(actions)
    || isFunction(actions),
    '[model.actions] should be undefined or plain object'
    + ' or function, but got ' + typeof actions
  );

  // check selectors
  invariant(
    typeof selectors === 'undefined' || isFunction(selectors),
    `[model.selectors] should be undefined or function, but got ${typeof selectors}`
  );

  // check sagas
  invariant(
    typeof sagas === 'undefined'
    || isPlainObject(sagas)
    || isFunction(sagas),
    `[model.sagas] should be undefined or plain object or function, but got ${typeof sagas}`
  );
}
