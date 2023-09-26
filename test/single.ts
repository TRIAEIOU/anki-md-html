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

const html = '<p>This is paragraph.</p><dl><dt>First Term</dt><dd>This is the <strong>definition</strong> of the first term.</dd><dd>This is another definition of the first term.</dd><dt>Second Term</dt><dd>This is one definition of the second term.</dd><dd>This is another definition of the second term.</dd></dl>'
const md = `This is paragraph.

First Term
:   This is the **definition** of the first term.
:   This is another definition of the first term.

Second Term
:   This is one definition of the second term.
:   This is another definition of the second term.`
//const html = 'one:<ul class="markdown-tight"><li>item</li><li>item2<ol class="markdown-tight"><li>n1</li><li>n2</li></ol></li></ul>two'
//const md = 'one:\n- item\n- item2\n    1. n1\n    2. n2\n\ntwo'

const converter = new Converter(DEFAULT_CFG)
//console.log(converter.html_to_markdown(html))
console.log(converter.markdown_to_html(md))
/*
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
*/