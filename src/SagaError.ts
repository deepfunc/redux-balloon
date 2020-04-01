import { SagaErrorType } from './types/sagas';

class SagaError extends Error implements SagaErrorType {
  public sourceErr: Error;

  constructor(err: Error, public detail: {}) {
    super(err.message);
    this.name = 'SagaError';
    this.sourceErr = err;
  }
}

export default SagaError;
