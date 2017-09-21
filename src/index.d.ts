export = Reless

declare class Reless<TState = {}> {
  constructor(initializer: Initializer<TState>)
  store: TState
  reducers: { [key: string]: Reducer<TState> }
  events: {
    newState?: (state: TState) => void
  }
}

declare type Initializer<TState> = {
  store?: TState
  reducers?:  { [key: string]: Reducer<TState> }
  events?: {
    newState?: (state: TState) => void
  }
}

declare type Reducer<TState> = (payload) => TState | CbWithState<TState>
declare type CbWithState<TState> = ( state: TState,) => TState | CbWithReducers<TState>
declare type CbWithReducers<TState> = ( reducers ) => TState | void | Reducer<TState> 
