import multiInput from "rollup-plugin-multi-input";
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import minifyLiterals from 'rollup-plugin-minify-html-literals';

const MODE_TEST = process.env.TEST ? true : false; 
const MODE_PROD = !MODE_TEST;
const DIST_PATH = 'dist';


const input = MODE_TEST ? './test/**/*.spec.ts' : './src/lit-line.ts';


export default {
  input,
  output: {
    format: 'esm',
    dir: DIST_PATH,
    sourcemap: true
  },
  plugins: [    
    multiInput(),
    typescript({declaration:true,declarationDir:DIST_PATH}),
    resolve(),

    MODE_PROD && terser(),
    MODE_PROD && minifyLiterals(),
  ]
};


