import invariant from 'invariant';
import { any, isPlainObject } from './utils';

export default function checkModel(model, existingModels) {
  const { namespace, reducers } = model;

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
    isPlainObject(reducers),
    `[model.reducers] should be plain object, but got ${typeof reducers}`
  );
}
