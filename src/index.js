export class Reless {
  constructor(initializer) {
    initializer = initializer || {}
    this.appState = { ...initializer.state }
    let reducers = { ...initializer.reducers }

    // Wrap all reducers so they can be called directly
    this.reducers = Object.keys(reducers).reduce((acc, name) => {
      const reducer = reducers[name]
      // wrap the reducer in a function accepting the payload
      acc[name] = payload => {
        if (typeof payload === 'function') {
          payload = payload(this.state)
        }
        // call the reducer with the payload
        let withState = reducer(payload)
        if (typeof withState === 'function') {
          // the reducer returned another function (withStateFn),
          // call withStateFn with the state
          let withReducers = withState(this.appState)
          if (typeof withReducers === 'function') {
            // the withStateFn returned a function (withReducersFn)
            // call withReducersFn with the reducers
            withReducers(this.reducers)
          } else {
            // merge the object from withStateFn with the current state
            this.appState = merge(this.appState, withReducers)
          }
        } else {
          // merge the object from the reducer with the current state
          this.appState = merge(this.appState, withState)
        }
      }
      return acc
    }, {})
  }

  get state() {
    return Object.freeze({ ...this.appState })
  }
}

function merge(a, b) {
  var obj = { ...a }
  for (var i in b) {
    obj[i] = b[i]
  }
  return obj
}
