export class Reless {
  state
  reducers

  constructor(initializer) {
    initializer = initializer || {}
    this.state = { ...initializer.state } || {}
    let reducers = { ...initializer.reducers } || {}

    this.reducers = Object.keys(
      reducers,
    ).reduce((acc, name) => {
      const reducer = reducers[name]
      acc[name] = () => {
        let withState = reducer()
        if (typeof withState === 'function') {
          let withUpdate = withState(this.state)
          if (typeof withUpdate === 'function') {
            withUpdate(this.update.bind(this))
          } else {
            this.state = merge(this.state, withUpdate)
          }
        } else {
          this.state = merge(this.state, withState)
        }
      }
      return acc
    }, {})
  }

  update(updateFn) {
    if (typeof updateFn === 'function') {
      let result = updateFn(this.state)
      if (result === 'function') {
        this.update(result)
      } else {
        this.state = merge(this.state, result)
      }
    } else {
      this.state = merge(this.state, updateFn)
    }
  }
}

function merge(a, b) {
  var obj = { ...a }
  for (var i in b) {
    obj[i] = b[i]
  }
  return obj
}
