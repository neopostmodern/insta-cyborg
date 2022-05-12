export type DataState<T> =
  | { loading: true }
  | { error: true; message?: string }
  | { data: T };
