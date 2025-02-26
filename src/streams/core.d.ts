import { Source } from 'callbag';

export function createSource<T>(producer: (next: (value: T) => void, complete: () => void, error: (err: any) => void) => void): Source<T>;

export function pipe<T, R>(source: Source<T>, ...operations: Array<(source: Source<T>) => Source<R>>): Source<R>; 