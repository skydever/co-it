import { TestBed } from '@angular/core/testing';
import {
  Action,
  ActionReducerMap,
  select,
  Store,
  StoreModule
} from '@ngrx/store';
import { WiredActions } from '../../../src/lib/__deprecated__/types';
import {
  createDucks,
  createReducerFrom,
  Ducks,
  effect,
  wireUpActions
} from '../../../src/public_api';

interface State {
  count: number;
}

interface RootState {
  counter: State;
}

class Counter {
  forEffect = effect('[Counter] Load Counter from API');

  set(state: State, payload: number): State {
    return {
      ...state,
      count: payload
    };
  }

  add(state: State, payload: number): State {
    return {
      ...state,
      count: state.count + payload
    };
  }
}

describe('When NgRxStore and NgRxDucks meet each other', () => {
  describe('and ducks are provided', () => {
    let wiredActions: WiredActions<Counter>;
    let initialState: State;
    let counterReducer: (state: State, action: Action) => State;
    let reducers: ActionReducerMap<RootState>;

    let store: Store<RootState>;
    let ducks: Ducks<Counter>;

    beforeEach(() => {
      wiredActions = wireUpActions(Counter, {
        set: '[Counter] Set',
        add: '[Counter] Add'
      });

      initialState = { count: 0 };
      counterReducer = (state = initialState, action: Action) =>
        createReducerFrom(wiredActions)(state, action);

      reducers = { counter: counterReducer };

      TestBed.configureTestingModule({
        imports: [StoreModule.forRoot(reducers)],
        providers: [
          {
            provide: Counter,
            useFactory: function(store: Store<State>) {
              return createDucks(wiredActions, store);
            },
            deps: [Store]
          }
        ]
      });

      store = TestBed.get(Store);
      ducks = TestBed.get(Counter);
    });

    it('should produce a new state after a duck quacks', done => {
      ducks.set(10);
      store.pipe(select(s => s.counter.count)).subscribe(count => {
        expect(count).toBe(10);
        done();
      });
    });

    it('should preserve asynchronous action types', () => {
      const counter = new Counter();
      expect(ducks.forEffect.type).toBe(counter.forEffect.type);
    });

    it('should handle multiple action calls', done => {
      ducks.set(10);
      ducks.add(10);

      store.pipe(select(s => s.counter.count)).subscribe(count => {
        expect(count).toBe(20);
        done();
      });
    });
  });
});
