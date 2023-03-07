import {nodeResolve} from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import commonjs from "@rollup/plugin-commonjs"
import terser from "@rollup/plugin-terser"

export default {
  "input": "index.ts",
  output: {
    file: "./bin/anki-md-html.js",
    format: "iife",
    name: "AnkiMdHtml",
    globals: {}
  },
  external: [],
  plugins: [
    typescript(),
    commonjs(),
    nodeResolve({ preferBuiltins: false, browser: true }),
    terser({format: {comments: false}})
  ]
}
