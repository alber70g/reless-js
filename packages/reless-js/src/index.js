export default class Reless {
  constructor(initializer) {
    initializer = initializer || {}
    this.appState = { ...initializer.state }
    let reducers = { ...initializer.reducers }
    let events = { ...initializer.events }
    this.events = events

    const devTools = window.__REDUX_DEVTOOLS_EXTENSION__
      ? window.__REDUX_DEVTOOLS_EXTENSION__.connect()
      : undefined
    devTools && devTools.init(this.appState)
    devTools && (reducers.setState = payload => JSON.parse(payload))

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
        // send to redux dev tools
        name !== 'setState' &&
          devTools &&
          devTools.send({ type: name, payload }, this.appState)
        if (events.newState) events.newState(this.state)
      }
      return acc
    }, {})

    devTools &&
      devTools.subscribe(message => {
        message.type === 'DISPATCH' &&
          message.state &&
          this.reducers.setState(message.state)
      })
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
