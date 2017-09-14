# Reless-js
A state management library, inspired by Flux architecture and the Redux implementation.

This implementation slightly deviates from the Flux spec, and doesn't work with 
actions and dispatching of actions. In Reless you can semi-directly call a reducer with 
some payload, while still keeping a single state, the unidirectional dataflow and 
possibilities to use the Redux-devtools.

- [Reless-js](#reless-js)
  - [Concepts](#concepts)
    - [Flux](#flux)
    - [Maintenance with Redux](#maintenance-with-redux)
- [Relessjs (to the rescue)](#relessjs-to-the-rescue)
  - [Example without and with state in the reducer](#example-without-and-with-state-in-the-reducer)
  - [Example with asynchronous call in reducer](#example-with-asynchronous-call-in-reducer)
  - [Asynchronous example using the newest state](#asynchronous-example-using-the-newest-state)

## Concepts

### Flux

Flux architecture is build around unidirectional data-flow.

You `dispatch` an `action`, that's is being `reduced` on the current `state`.
After all reducers finished doing their job, the listeners are called to 
notify that there was a potential change in the state.

### Maintenance with Redux

> *skip to [Relessjs (to the rescue)](#relessjs-to-the-rescue) if you want to know what Reless can do for you.*

The main thing that troubles me is the maintenance when using Redux. 
(If you know Redux and want to skip to the real deal of this library: ) 

When creating actions you're not just calling `dispatch({ type: 'INCREMENT_COUNTER' })`, 
but you would define a `constants` file where you define all actions:

```js
module.exports = {
  incrementCounter = 'INCREMENT_COUNTER'
}
```

Now you can call use the constant instead of typing it, and it's in one place to 
maintain. The result:

```js
let constants = require('./constants.js')

dispatch({ type: constants.incrementCounter })
```

But wait, we might have a very complex action, where, based on some properties we'd 
like to convert it into another action. So let's create an `actionFactory`, and 
let's not forget to import the `constants`:

```js
let constants = require('./constants.js')

module.exports = {
  increment: (someData) => {
    return { 
      type: constants.incrementCounter, 
      data: someData.map(x => x.toLowerCase()) 
    }
  }
}
```

But wait, we haven't even talked about the reducer yet:

```js
let constants = require('./constants.js')

module.exports = {
  counter: (state, action) {
    if (typeof state === 'undefined') {
      return { ...state, counter: 0 }
    }
    switch (action.type) {
      case constants.incrementCounter:
        return { ...state, counter: state.counter + 1 }
      case constants.decrementCounter:
        return { ...state, counter: state.counter - 1 }
      default:
        return state
    }
  }
}
```

This process is a bit cumbersome. If you want a bit of functionality you have to 
change 3 files and this grows when you have more and bigger actions and reducers. 
Maybe this is not a problem for a big enterprise-like application but for something 
small, you'd like something more to the point. This is where Relessjs can help.

# Relessjs (to the rescue)

> *Have a look here to see the basic scenarios [test/showcase](test/showcase)*

So... You still want to use a single state, but looking at these 4 files, Redux might be overkill. 
Now you can use Relessjs to create a store, call reducers "directly" and update the state
in a unidirectional flow.

With `Relessjs` we can give you exactly that, but with less files and 
**no constants**. Your reducer *is* your action. So you *call* your reducer, and
watch the state change.

## Example without and with state in the reducer

Let's give a simple example of a counter:
- setCountToOne: call a reducer 
- setCount: call a reducer with a payload
- incrementCounter: call a reducer, and use the previous state

The simplest form of the `reducer` is of type `payload => (state | (state => state))`. 

The reducer can be called with a payload. Then you can directly return a `state` or return a `function` of type 
`state => state`. When you return a function from the state, it'll be called 
with the current `state`. You can use this state to increment a counter.

```js
let store = new Reless({
  state: { counter: 0 },
  reducers: { 
    setCountToOne: () => ({ counter: 1 }),
    setCount: (count) => ({ counter: count }),
    incrementCounter: () = state => ({ counter: state.counter + 1 }),
  },
})

store.reducers.setCountToOne()
store.state.counter // 1

store.reducers.setCount(4)
store.state.counter // 4

store.reduces.incrementCounter()
store.state.counter // 5
```

## Example with asynchronous call in reducer 

If you want to do something asynchronous, your reducer should be of type
`payload => state => reducers => void`

Here you get all the reducers that you can call here. This way we can keep track
of the reducer calls. 

We've had some prior art, where we passed an `update` function, 
but the issue with that is: you cannot really log what is happening since you only 
pass a new state instead of calling a reducer. In terms of Redux, you want to have 
an action and not directly set a state, so that you have a nice trail of actions 
that are dispatched, to see where bugs are happening.

```js
let store = new Reless({
  state: { counter: 0 },
  reducers: { 
    setLoading: loading => ({ loading })
    doAsync: () => () => (reducers) => {
      reducers.setLoading(true)
      setTimeout(() => {
        reducers.setLoading(false)
      }, 1000)
    }
  },
})

store.reducers.doAsync()
store.state.loading // true
// one second later
store.state.loading // false
```

## Asynchronous example using the newest state

When returning a function in the `reducer` call, it'll be called with the latest
state. This will allow you to create a countdown based on the last state.

The function passed to the `reducer` has the following type: `state => state`.

```js
  let store = new Reless({
    state: { counter: 3 },
    reducers: {
      setCounter: (counter) => ({ counter })
      countdown: () => () => reducers => {
        let interval = setInterval(() => {
          reducers.setCounter(state => { 
            if (state.counter === 1) {
              clearInterval(interval)
              return 0
            }
            return state.counter - 1
          })
        }, 1000)
      },
    },
  })
  // start with 3
  store.reducers.countdown()
  // directly after calling the reducer
  store.state.counter // 3
  // first second passes
  store.state.counter // 2
  // second second passes
  store.state.counter // 1
  // third second passes
  store.state.counter // 0
```
