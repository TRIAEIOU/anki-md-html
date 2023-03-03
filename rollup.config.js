import {nodeResolve} from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import commonjs from "@rollup/plugin-commonjs"
import terser from "@rollup/plugin-terser"

function bundle(input_file, output_file, output_name) {
  return {
    input: input_file,
    output: {
      file: output_file,
      format: "iife",
      name: output_name,
      globals: {}
    },
    external: [],
    plugins: [
      typescript(),
      commonjs(),
      nodeResolve({ preferBuiltins: false, browser: true }),
      terser({format: {comments: false}})
    ],
    onwarn: (warning, warn) => { // Supress "errounous warnings"
      if ((warning.pluginCode === undefined
        && warning.message.startsWith(String`Circular dependency:`))
      )
        return
      warn(warning)
      //      console.log(JSON.stringify(warning, null, 1))
    },
  }
}

export default [
  bundle("./src/converter.ts", "./bin/converter.js", "AnkiMarkdownHtml"),
]