import invariant from 'invariant';
import { any } from 'ramda';

export default function checkModel(model, existingModels) {
  const {namespace} = model;

  invariant(
    namespace,
    '[model.namespace] should be defined'
  );
  invariant(
    typeof namespace === 'string',
    `[model.namespace] should be string, but got ${typeof namespace}`
  );
  invariant(
    any(model => model.namespace === namespace)(existingModels),
    '[model.namespace] should be unique!'
  );
}
