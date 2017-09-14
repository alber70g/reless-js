import { Reless } from '../src'

test('showcase: update the state to Two', () => {
  let store = new Reless({
    state: { counter: 1, loading: false },
    reducers: {
      setCountToTwo: () => {},
    },
  })

  store.reducers.setCountToTwo()
  expect(store.state.counter).toBe(2)
  expect(store.state.loading).toBe(false)
})

test('showcase: update the state with a payload', () => {
  let store = new Reless({
    state: { counter: 1, loading: false },
    reducers: {
      setCountTo: count => {},
    },
  })

  store.reducers.setCountTo(100)
  expect(store.state.counter).toBe(100)
})

test('showcase: increment counter using the latest state', () => {
  let store = new Reless({
    state: { counter: 1, loading: false },
    reducers: {
      incrementCounter: () => {},
    },
  })

  store.reducers.incrementCounter()
  expect(store.state.counter).toBe(2)
})

jest.useFakeTimers()

test('showcase: do something asynchronous', () => {
  let store = new Reless({
    state: { counter: 1, loading: false },
    reducers: {
      doAsync: () => {},
    },
  })

  expect(store.state.loading).toBe(false)
  store.reducers.doAsync()
  expect(store.state.loading).toBe(true)
  jest.runAllTimers()
  expect(store.state.loading).toBe(true)
})

test('showcase: do something async, with the latest state', () => {
  let store = new Reless({
    state: { counter: 3, loading: false },
    reducers: {
      startCountingDown: () => {},
    },
  })
  // start with 3 
  expect(store.state.counter).toBe(3)
  store.reducers.startCountingDown()
  // after starting to count, still 3
  expect(store.state.counter).toBe(3)

  // after 1 second, be 2
  jest.runTimersToTime(1000)
  expect(store.state.counter).toBe(2)
  
  jest.runTimersToTime(1000)
  expect(store.state.counter).toBe(1)
  
  jest.runTimersToTime(1000)
  expect(store.state.counter).toBe(0)
})
