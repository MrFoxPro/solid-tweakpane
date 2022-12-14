import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import strip from '@rollup/plugin-strip'
import del from 'rollup-plugin-delete'
const extensions = ['.ts', '.tsx', '.js']

/** @type {import('rollup').OutputOptions} */
const output = {}
/** @type {import('rollup').RollupOptions} */
const config = {
  input: 'src/index.ts',
  external: ['solid-js', 'tweakpane', '@tweakpane/core'],
  treeshake: 'smallest',
  output: [
    {
      ...output,
      format: 'es',
      dir: 'dist/es',
    },
    {
      ...output,
      format: 'cjs',
      dir: 'dist/cjs',
    },
  ],
  plugins: [
    nodeResolve({
      extensions,
    }),
    babel({
      extensions,
      babelHelpers: 'bundled',
      presets: ['solid', '@babel/preset-typescript'],
      plugins: ['babel-plugin-ts-nameof'],
      exclude: /node_modules\//,
    }),
    commonjs({
      extensions,
    }),
    strip({
      include: /\.(js|mjs|ts|tsx|jsx)/,
    }),
    del({ targets: 'dist/*' }),
  ],
}
export default config
