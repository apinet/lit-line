import multiInput from "rollup-plugin-multi-input";
import ts from "@wessberg/rollup-plugin-ts";
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import minifyLiterals from 'rollup-plugin-minify-html-literals';

import copy from 'rollup-plugin-copy';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const MODE_DEV = process.env.ROLLUP_WATCH ? true : false;
const MODE_TEST = process.env.TEST ? true : false; 
const MODE_PROD = !MODE_DEV && !MODE_TEST;
const DIST_PATH = 'dist';


const input = MODE_TEST ? './test/**/*.spec.ts' :
              MODE_DEV ? './demo/index-app.ts' :
              MODE_PROD ? './src/lit-line.ts' : '';

const relative = MODE_TEST ? 'test/' :
              MODE_DEV ? 'demo/' :
              MODE_PROD ? 'src/' : '';


export default {
  input,
  output: {
    format: 'esm',
    dir: DIST_PATH,
    sourcemap: true
  },
  plugins: [    
    multiInput({ relative }),
    ts(),
    resolve(),

    MODE_PROD && terser(),
    MODE_PROD && minifyLiterals(),

    MODE_DEV && copy({targets: [{ src: 'demo/index.html', dest: DIST_PATH}]}),
    MODE_DEV && serve({contentBase: DIST_PATH, open: true}),
    MODE_DEV && livereload({watch: DIST_PATH})
  ]
};


