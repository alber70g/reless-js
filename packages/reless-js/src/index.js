export default class Reless {
  constructor(initializer) {
    initializer = initializer || {}
    this.appState = { ...initializer.state }
    let reducers = { ...initializer.reducers }
    let events = { ...initializer.events }
    this.events = events
    // Wrap all reducers so they can be called directly
    this.reducers = Object.keys(reducers).reduce((acc, name) => {
      const reducer = reducers[name]
      // wrap the reducer in a function accepting the payload
      acc[name] = payload => {
        // reducer to use for __REDUX_DEVTOOLS_EXTENSION__
        if (events.reducer) events.reducer(this.state, name)
        if (typeof payload === 'function') {
          payload = payload(this.state)
        }
        // call the reducer with the payload
        let withState = reducer(payload)
        // define withReducers and fromWithReducers to be able to _merge lateron
        let withReducers = null
        let fromWithReducers = null
        if (typeof withState === 'function') {
          // the reducer returned another function (withStateFn),
          // call withStateFn with the state
          withReducers = withState(this.appState)
          if (typeof withReducers === 'function') {
            // the withStateFn returned a function (withReducersFn)
            // call withReducersFn with the reducers
            fromWithReducers = withReducers(this.reducers)
          }
        }
        // _merge the result of either function with the current state
        this.appState = this._merge(
          this.appState,
          fromWithReducers || withReducers || withState,
        )
        if (events.newState) events.newState(this.state)
      }
      return acc
    }, {})
  }

  get state() {
    return Object.freeze({ ...this.appState })
  }

  _merge(a, b) {
    for (var i in b) {
      a[i] = b[i]
    }
    return a
  }
}
