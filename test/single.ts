import test from 'tape'
import {Converter, Options} from '../src/lib'
export {}
// Constants for readability
const DEFAULT_CFG = {
  "Markdown format": {
    "bullet": "-",
    "listItemIndent": "one",
    "ruleRepetition": 10,
    "tightDefinitions": true,
    "fences": true,
    "hardBreak": "spaces"
  },
  "Markdown extensions": {
    "Definition lists": true,
    "Inline media": true,
    "Tables": "extended",
    "Table newline": "¨",
    "Underline": true,
    "Superscript": true,
    "Subscript": true,
    "Strikethrough": "double"
  }
} as Options


const html = "<"
const md = "<"

test('single', (t) => {
  const converter = new Converter(DEFAULT_CFG)
  t.deepEqual(
    converter.html_to_markdown(html),
    md,
    "should match"
  )

  t.end()
})

test('single', (t) => {
  const converter = new Converter(DEFAULT_CFG)
  t.deepEqual(
    converter.markdown_to_html(md),
    html,
    "should match"
  )

  t.end()
})
