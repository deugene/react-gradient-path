import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import serve from 'rollup-plugin-serve';

const outputDir = 'public';

/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
  {
    input: 'src/example.tsx',
    output: {
      name: 'dev',
      file: `${outputDir}/bundle.js`,
      format: 'iife',
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
        preventAssignment: true,
      }),
      resolve(),
      commonjs(),
      typescript({tsconfig: './tsconfig.json'}),
      serve({
        contentBase: [outputDir],
        port: 3000,
      }),
    ],
  },
];
