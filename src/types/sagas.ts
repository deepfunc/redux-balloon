export type SagaErrorType = Error & {
  sourceErr: Error;
  detail?: {};
};
