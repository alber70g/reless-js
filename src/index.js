export class Reless {
  constructor(initializer) {
    initializer = initializer || {}
    this.appState = { ...initializer.state }
    let reducers = { ...initializer.reducers }

    // Wrap all reducers so they can be called directly
    this.reducers = Object.keys(
      reducers,
    ).reduce((acc, name) => {
      const reducer = reducers[name]
      // wrap the reducer in a function accepting the payload
      acc[name] = payload => {
        // call the reducer with the payload
        let withState = reducer(payload)
        if (typeof withState === 'function') {
          // the reducer returned another function (withStateFn), 
          // call withStateFn with the state
          let withUpdate = withState(this.appState)
          if (typeof withUpdate === 'function') {
            // the withStateFn returned a function (withUpdateFn)
            // call withUpdateFn with the update function 
            withUpdate(this.update.bind(this))
          } else {
            // merge the object from withStateFn with the current state
            this.appState = merge(this.appState, withUpdate)
          }
        } else {
          // merge the object from the reducer with the current state
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
