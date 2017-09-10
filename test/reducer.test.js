import { Reless } from '../src'

let initial = {
  reducers: {
    add: () => {},
    setCounterToTen: () => ({ counter: 10 }),
    setNewProperty: () => ({ newProp: 1 }),
    addToCounter: () => state => ({
      counter: state.counter + 1,
    }),
  },
  state: {
    counter: 0,
  },
}

test('Reless returns an object with state and reducers', () => {
  let store = new Reless()
  expect(store['state']).toBeTruthy()
  expect(store['reducers']).toBeTruthy()
})

test('Reless returns state with contents', () => {
  let store = new Reless(initial)
  expect(store.state.counter).toBe(0)
  expect(store.reducers.add).toBeTruthy()
})

test("when calling a reducer that doesn't use state, the state updates", () => {
  let store = new Reless(initial)
  store.reducers.setCounterToTen()
  expect(store.state.counter).toBe(10)
})

test('when calling a reducer that creates a new property on the state, the property is created', () => {
  let store = new Reless(initial)
  store.reducers.setNewProperty()
  expect(store.state.newProp).toBe(1)
})

test('when calling a reducer that uses state, the state is updated', () => {
  let store = new Reless(initial)
  store.reducers.addToCounter()
  expect(store.state.counter).toBe(1)
  store.reducers.addToCounter()
  expect(store.state.counter).toBe(2)
})

test("when creating two Reless instances from initial, states don't update both", () => {
  let store = new Reless(initial)
  store.reducers.setCounterToTen()
  expect(store.state.counter).toBe(10)

  let store2 = new Reless(initial)
  expect(store2.state.counter).toBe(0)
})

jest.useFakeTimers()

test('when doing something async, a reducer can update state twice', () => {
  let store = new Reless({
    state: { loading: false, count: 0 },
    reducers: {
      doAsync: () => () => update => {
        update({ loading: true })
        setTimeout(() => {
          update({ loading: false })
        }, 1)
      },
    },
  })

  expect(store.state.loading).toBe(false)
  store.reducers.doAsync()
  expect(store.state.loading).toBe(true)
  jest.runAllTimers()
  expect(store.state.loading).toBe(false)
})

test('when doing async, a reducer can update the state based on the latest state', () => {
  let store = new Reless({
    state: { loading: false, count: 0 },
    reducers: {
      doAsync: () => () => update => {
        update(state => ({
          loading: true,
          count: state.count + 1,
        }))
        setTimeout(() => {
          update(() => ({
            loading: false,
          }))
        }, 1000)
      },
    },
  })

  expect(store.state.loading).toBe(false)
  expect(store.state.count).toBe(0)
  store.reducers.doAsync()
  expect(store.state.count).toBe(1)
  expect(store.state.loading).toBe(true)
  jest.runAllTimers()
  expect(store.state.loading).toBe(false)
})

test('update async with setInterval, should use latest state', () => {
  let store = new Reless({
    state: { count: 3 },
    reducers: {
      doAsync: () => () => update => {
        let interval = setInterval(() => {
          update(state => {
            if (state.count === 1) {
              clearInterval(interval)
              return { count: 0 }
            }
            return { count: state.count - 1 }
          })
        }, 1000)
      },
    },
  })

  expect(store.state.count).toBe(3)
  store.reducers.doAsync()
  expect(store.state.count).toBe(3)
  jest.runTimersToTime(1000)
  expect(store.state.count).toBe(2)
  jest.runTimersToTime(1000)
  expect(store.state.count).toBe(1)
  jest.runTimersToTime(1000)
  expect(store.state.count).toBe(0)
})
