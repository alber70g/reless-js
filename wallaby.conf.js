module.exports = (wallaby) => {
  return {
    testFramework: 'jest',
    files: ['src/*.js'],
    tests: ['test/**/*.test.js'],
    env: {
      type: 'node',
      runner: 'node',
    },
    compilers: {
      '**/*.js': wallaby.compilers.babel(),
    },
    debug: true,
  }
}
