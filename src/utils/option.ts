// Option type for null safety
export type Option<T> = Some<T> | typeof None;

export type Some<T> = {
  readonly _tag: 'Some';
  readonly value: T;
};

export const Some = <T>(value: T): Some<T> => ({
  _tag: 'Some',
  value
});

export type NoneType = {
  readonly _tag: 'None';
};

export const None: NoneType = {
  _tag: 'None'
} as const;

// Type guard functions
export const isSome = <T>(option: Option<T>): option is Some<T> =>
  option._tag === 'Some';

export const isNone = <T>(option: Option<T>): option is typeof None =>
  option._tag === 'None';

// Safe type transformations
export const map = <T, U>(option: Option<T>, f: (value: T) => U): Option<U> =>
  isSome(option) ? Some(f(option.value)) : None;

export const flatMap = <T, U>(option: Option<T>, f: (value: T) => Option<U>): Option<U> =>
  isSome(option) ? f(option.value) : None;

export const getOrElse = <T>(option: Option<T>, defaultValue: T): T =>
  isSome(option) ? option.value : defaultValue;

export const fold = <T, U>(option: Option<T>, onNone: () => U, onSome: (value: T) => U): U =>
  isSome(option) ? onSome(option.value) : onNone();

// Conversion utilities
export const fromNullable = <T>(value: T | null | undefined): Option<T> =>
  value === null || value === undefined ? None : Some(value);

export const toNullable = <T>(option: Option<T>): T | null =>
  isSome(option) ? option.value : null; 