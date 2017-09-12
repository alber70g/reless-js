export class Reless {
  appState
  reducers

  constructor(initializer) {
    initializer = initializer || {}
    this.appState = { ...initializer.state } || {}
    let reducers = { ...initializer.reducers } || {}

    this.reducers = Object.keys(
      reducers,
    ).reduce((acc, name) => {
      const reducer = reducers[name]
      acc[name] = payload => {
        let withState = reducer(payload)
        if (typeof withState === 'function') {
          let withUpdate = withState(this.appState)
          if (typeof withUpdate === 'function') {
            withUpdate(this.update.bind(this))
          } else {
            this.appState = merge(this.appState, withUpdate)
          }
        } else {
          this.appState = merge(this.appState, withState)
        }
      }
      return acc
    }, {})
  }

  update(updateFn) {
    if (typeof updateFn === 'function') {
      let result = updateFn(this.appState)
      if (result === 'function') {
        this.update(result)
      } else {
        this.appState = merge(this.appState, result)
      }
    } else {
      this.appState = merge(this.appState, updateFn)
    }
  }

  set state(state) {
    this.appState = state;
  }

  get state() {
    return { ...this.appState }
  }
}

function merge(a, b) {
  var obj = { ...a }
  for (var i in b) {
    obj[i] = b[i]
  }
  return obj
}
