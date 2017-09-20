import babel from 'rollup-plugin-babel'

export default {
	input: 'src/index.js',
	output: {
		file: 'dist/reless.js',
		format: 'umd',
	},
	name: 'reless',
	sourcemap: 'dist/reless.js.map',
	plugins: [
		babel({
			exclude: 'node_modules/**',
		}),
	],
}
