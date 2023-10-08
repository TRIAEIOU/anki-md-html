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

const tests = [
[
`A paragraph

A second paragraph`,
`A paragraph<br><br>A second paragraph`,
'should convert paragraph breaks to `<br><br>` rather than `<p>`'
], [
`Unordered list:

- One
- Two`,
`Unordered list:<ul class="markdown-tight"><li>One</li><li>Two</li></ul>`,
'should support unordered lists with tight/loose class'
], [
`Ordered list:

1. One
2. Two`,
`Ordered list:<ol class="markdown-tight"><li>One</li><li>Two</li></ol>`,
'should support ordered lists with tight/loose class'
], [
`Nested list:

- One
  - Alpha
  - Bravo
- Two
- Three`,
`Nested list:<ul class="markdown-tight"><li>One<ul class="markdown-tight"><li>Alpha</li><li>Bravo</li></ul></li><li>Two</li><li>Three</li></ul>`,
'nested lists should be inside "parent" `<li></li>`'
], [
`Some **bold** text`,
`Some <b>bold</b> text`,
'should convert `strong` to `<b>`'
], [
`Some *italic* text`,
`Some <i>italic</i> text`,
'should convert `emphasis` to `<i>`'
], [
`Some =underlined **bold** text= here`,
`Some <u>underlined <b>bold</b> text</u> here`,
'should support underline'
], [
`Some ^superscript^ text`,
`Some <sup>superscript</sup> text`,
'should support superscript'
], [
`Some ~subscript~ text`,
`Some <sub>subscript</sub> text`,
'should support subscript text'
], [
`Some ~~strikethrough~~ text`,
`Some <del>strikethrough</del> text`,
'should support strikethrough text'
],[
`A GFM table:

| GFM   | Style |
| :---- | :---: |
| table |  with |
| cells |  rows |`,
`A GFM table:<table><thead><tr><th align="left">GFM</th><th align="center">Style</th></tr></thead><tbody><tr><td align="left">table</td><td align="center">with</td></tr><tr><td align="left">cells</td><td align="center">rows</td></tr></tbody></table>`,
'should support GFM style tables'
], [
`A headerless aligned table:

| :---- | :--: |
| table | with |
| cells | rows |`,
`A headerless aligned table:<table><tbody><tr><td align="left">table</td><td align="center">with</td></tr><tr><td align="left">cells</td><td align="center">rows</td></tr></tbody></table>`,
'should support headerless aligned tables'
], [
`A headerless table:

| ----- | ---- |
| table | with |
| cells | rows |`,
`A headerless table:<table><tbody><tr><td>table</td><td>with</td></tr><tr><td>cells</td><td>rows</td></tr></tbody></table>`,
'should support headerless non-aligned tables'
], [
`| ------ | --------- |
| a      | table     |
| with¨a | linebreak |`,
`<table><tbody><tr><td>a</td><td>table</td></tr><tr><td>with<br>a</td><td>linebreak</td></tr></tbody></table>`,
'should support trema as linebreak in table cell'
], [
`Inline media :video[\\_im-media-00000000-0000-0000-0000-000000000000.webm]{auto_front auto_back loop} support`,
`Inline media <video id="im-media-00000000-0000-0000-0000-000000000000" src="_im-media-00000000-0000-0000-0000-000000000000.webm" class="inline-media" controls auto_front="" auto_back="" loop oncanplay="if(this.getRootNode().querySelector('anki-editable') === null &amp;&amp; this.offsetParent !== null &amp;&amp; ((this.hasAttribute('auto_front') &amp;&amp; !document.body.classList.contains('back')) || (this.hasAttribute('auto_back') &amp;&amp; document.body.classList.contains('back')))) {this.play();}" oncontextmenu="pycmd(this.id); return true;"></video>\u00A0support`,
'should support inline media directive'
], [
`Term
:   And its **bold** defintion

Second
:   Term should be fine`,
`<dl><dt>Term</dt><dd>And its <b>bold</b> defintion</dd><dt>Second</dt><dd>Term should be fine</dd></dl>`,
'should support definition lists'
], [
`A {{c1::clozed}} word.

Clozed list: {{c2::

- One
- Two

}}

Clozed list item:

- {{c2::One}}
- Two

Clozed nested list:

- One {{c3::

  - Alpha
  - Bravo

  }}

- Two

- Three`,
`A {{c1::clozed}} word.<br><br>Clozed list: {{c2::<ul class="markdown-tight"><li>One</li><li>Two</li></ul>}}<br><br>Clozed list item:<ul class="markdown-tight"><li>{{c2::One}}</li><li>Two</li></ul>Clozed nested list:<ul class="markdown-loose"><li>One {{c3::<ul class="markdown-tight"><li>Alpha</li><li>Bravo</li></ul>}}</li><li>Two</li><li>Three</li></ul>`,
'should support clozes'
]
]

const md = [
...tests,
[
`Non-breaking newline ->
<-, breaking newline ->  
<-`,
`Non-breaking newline ->\n&lt;-, breaking newline -><br>&lt;-`,
'should support double space linebreaks (will fail html → md)'
]
]

const html = [
...tests,
[
`Non-breaking newline -> <-, breaking newline ->  
<-`,
`Non-breaking newline ->\n&lt;-, breaking newline -><br>&lt;-`,
'should support double space linebreaks (will fail html → md)'
]
]


const CPX_MD =
`## Ok\n\nParagraph with breaking newline ->  \n<-\n\nUnordered list:\n\n- One\n- Two\n\nOrdered list:\n\n1. One\n2. Two\n\nNested list:\n\n- One\n  - Alpha\n  - Bravo\n- Two\n- Three\n\nA {{c1::clozed}} word.\n\nClozed list: {{c2::\n\n- One\n- Two\n\n}}\n\nClozed list item:\n\n- {{c2::One}}\n- Two\n\nClozed nested list:\n\n- One {{c3::\n\n  - Alpha\n  - Bravo\n\n  }}\n\n- Two\n\n- Three\n\nA GFM table:\n\n| GFM   | Style |\n| :---- | :---: |\n| table |  with |\n| cells |  rows |\n\nA headerless aligned table:\n\n| :---- | :--: |\n| table | with |\n| cells | rows |\n\nA headerless table:\n\n| ----- | ---- |\n| table | with |\n| cells | rows |\n\nInline media:\u00A0:video[\\_im-media-87243454-a9c9-4bdf-a763-1347baad9cf3.webm]{auto_front auto_back loop}\u00A0`
const CPX_HTML =
'<h2>Ok</h2>Paragraph with breaking newline -><br>&lt;-<br><br>Unordered list:<ul class="markdown-tight"><li>One</li><li>Two</li></ul>Ordered list:<ol class="markdown-tight"><li>One</li><li>Two</li></ol>Nested list:<ul class="markdown-tight"><li>One<ul class="markdown-tight"><li>Alpha</li><li>Bravo</li></ul></li><li>Two</li><li>Three</li></ul>A {{c1::clozed}} word.<br><br>Clozed list: {{c2::<ul class="markdown-tight"><li>One</li><li>Two</li></ul>}}<br><br>Clozed list item:<ul class="markdown-tight"><li>{{c2::One}}</li><li>Two</li></ul>Clozed nested list:<ul class="markdown-loose"><li>One {{c3::<ul class="markdown-tight"><li>Alpha</li><li>Bravo</li></ul>}}</li><li>Two</li><li>Three</li></ul>A GFM table:<table><thead><tr><th align="left">GFM</th><th align="center">Style</th></tr></thead><tbody><tr><td align="left">table</td><td align="center">with</td></tr><tr><td align="left">cells</td><td align="center">rows</td></tr></tbody></table>A headerless aligned table:<table><tbody><tr><td align="left">table</td><td align="center">with</td></tr><tr><td align="left">cells</td><td align="center">rows</td></tr></tbody></table>A headerless table:<table><tbody><tr><td>table</td><td>with</td></tr><tr><td>cells</td><td>rows</td></tr></tbody></table>Inline media:\u00A0<video id="im-media-87243454-a9c9-4bdf-a763-1347baad9cf3" src="_im-media-87243454-a9c9-4bdf-a763-1347baad9cf3.webm" class="inline-media" controls auto_front="" auto_back="" loop oncanplay="if(this.getRootNode().querySelector(\'anki-editable\') === null &amp;&amp; this.offsetParent !== null &amp;&amp; ((this.hasAttribute(\'auto_front\') &amp;&amp; !document.body.classList.contains(\'back\')) || (this.hasAttribute(\'auto_back\') &amp;&amp; document.body.classList.contains(\'back\')))) {this.play();}" oncontextmenu="pycmd(this.id); return true;"></video>\u00A0'

test('markdown_to_html', (t) => {
  const converter = new Converter(DEFAULT_CFG)
  for (const test of md) {
    t.deepEqual(
      converter.markdown_to_html(test[0]),
      test[1],
      test[2]
    )
  }

  t.deepEqual(
    converter.markdown_to_html(CPX_MD),
    CPX_HTML,
    'should support complex markdown to render correctly'
  )

  t.end()
})

test('html_to_markdown', (t) => {
  const converter = new Converter(DEFAULT_CFG)
  for (const test of html) {
    t.deepEqual(
      converter.html_to_markdown(test[1]),
      test[0],
      test[2]
    )
  }

  t.deepEqual(
    converter.html_to_markdown(CPX_HTML),
    CPX_MD,
    'should support complex markdown to render correctly'
  )

  t.end()
})


// These roundtrips require reasonably formated markdown
test('roundtrip', (t) => {
  const converter = new Converter(DEFAULT_CFG)
  let md = converter.html_to_markdown(converter.markdown_to_html(CPX_MD))
  t.deepEqual(
    md,
    CPX_MD,
    'should support roundtrip of complex markdown without change'
  )

  let html = converter.markdown_to_html(converter.html_to_markdown(CPX_HTML))
  t.deepEqual(
    html,
    CPX_HTML,
    'should support roundtrip of complex HTML without change'
  )

  t.end()
})

/*
test('single', (t) => {
  const converter = new Converter(DEFAULT_CFG)
  const test = tests[13]
  t.deepEqual(
    converter.html_to_markdown(test[1]),
    test[0],
    test[2]
  )

  t.end()
})
*/
/*
test('single', (t) => {
  const converter = new Converter(DEFAULT_CFG)
  const test = tests[12]
  t.deepEqual(
    converter.markdown_to_html(test[0]),
    test[1],
    test[2]
  )

  t.end()
})
*/