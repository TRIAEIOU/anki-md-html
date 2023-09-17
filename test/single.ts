import test from 'tape'
import {Converter, Options} from '../src/lib'
import { tightenLists } from '../src/lib/extensions/list-type'

export {}
// Constants for readability
const DEFAULT_CFG = {
  "Markdown format": {
    "bullet": "-",
    "listItemIndent": "tab",
    "listItemIndentLeadOnly": true,
    "tightenLists": true,
    "tightenHeadings": 3,
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


const html = 'one:<ul class="markdown-tight"><li>item</li><li>item2<ol class="markdown-tight"><li>n1</li><li>n2</li></ol></li></ul>two'
const md = 'one:\n- item\n- item2\n    1. n1\n    2. n2\n\ntwo'

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
