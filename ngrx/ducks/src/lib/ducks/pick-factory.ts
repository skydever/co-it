import { MemoizedSelector, select, Store } from '@ngrx/store';
import { PickSelector } from '../typings';

export function pickFactory(store: Store<any>): PickSelector {
  return {
    pick<TState, TResult>(selector: MemoizedSelector<TState, TResult>) {
      return store.pipe(select(selector));
    }
  };
}
