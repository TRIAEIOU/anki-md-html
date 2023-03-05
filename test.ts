import test from 'tape'
import {html_to_markdown, markdown_to_html, init} from './lib'
import type { Configuration } from './lib'
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
}
const CPX_MD =
`## Ok\n\nParagraph with breaking newline ->  \n<-\n\nUnordered list:\n\n- One\n- Two\n\nOrdered list:\n\n1. One\n2. Two\n\nNested list:\n\n- One\n  - Alpha\n  - Bravo\n- Two\n- Three\n\nA {{c1::clozed}} word.\n\nClozed list: {{c2::\n\n- One\n- Two\n\n}}\n\nClozed list item:\n\n- {{c2::One}}\n- Two\n\nClozed nested list:\n\n- One {{c3::\n\n  - Alpha\n  - Bravo\n\n  }}\n\n- Two\n\n- Three\n\nA GFM table:\n\n| GFM   | Style |\n| :---- | :---: |\n| table |  with |\n| cells |  rows |\n\nA headerless aligned table:\n\n| :---- | :--: |\n| table | with |\n| cells | rows |\n\nA headerless table:\n\n| ----- | ---- |\n| table | with |\n| cells | rows |\n\nInline media:\u00A0:video[\\_im-media-87243454-a9c9-4bdf-a763-1347baad9cf3.webm]{auto_front auto_back loop}\u00A0`
const CPX_HTML =
'<h2>Ok</h2>Paragraph with breaking newline -><br>&#x3C;-<br><br>Unordered list:<ul class="markdown-tight"><li>One</li><li>Two</li></ul>Ordered list:<ol class="markdown-tight"><li>One</li><li>Two</li></ol>Nested list:<ul class="markdown-tight"><li>One<ul class="markdown-tight"><li>Alpha</li><li>Bravo</li></ul></li><li>Two</li><li>Three</li></ul>A {{c1::clozed}} word.<br><br>Clozed list: {{c2::<ul class="markdown-tight"><li>One</li><li>Two</li></ul>}}<br><br>Clozed list item:<ul class="markdown-tight"><li>{{c2::One}}</li><li>Two</li></ul>Clozed nested list:<ul class="markdown-loose"><li>One {{c3::<ul class="markdown-tight"><li>Alpha</li><li>Bravo</li></ul>}}</li><li>Two</li><li>Three</li></ul>A GFM table:<table><thead><tr><th align="left">GFM</th><th align="center">Style</th></tr></thead><tbody><tr><td align="left">table</td><td align="center">with</td></tr><tr><td align="left">cells</td><td align="center">rows</td></tr></tbody></table>A headerless aligned table:<table><tbody><tr><td align="left">table</td><td align="center">with</td></tr><tr><td align="left">cells</td><td align="center">rows</td></tr></tbody></table>A headerless table:<table><tbody><tr><td>table</td><td>with</td></tr><tr><td>cells</td><td>rows</td></tr></tbody></table>Inline media:\u00A0<video id="im-media-87243454-a9c9-4bdf-a763-1347baad9cf3" src="_im-media-87243454-a9c9-4bdf-a763-1347baad9cf3.webm" class="inline-media" controls auto_front="" auto_back="" loop oncanplay="if(this.getRootNode().querySelector(\'anki-editable\') === null &#x26;&#x26; this.offsetParent !== null &#x26;&#x26; ((this.hasAttribute(\'auto_front\') &#x26;&#x26; !document.body.classList.contains(\'back\')) || (this.hasAttribute(\'auto_back\') &#x26;&#x26; document.body.classList.contains(\'back\')))) {this.play();}" oncontextmenu="pycmd(this.id); return true;"></video>\u00A0'

const nested = '<ul><li>One<ul><li>Alpha</li><li>Bravo</li></ul></li><li>Two</li></ul>'

test('markdown_to_html', (t) => {
  const cfg = init(DEFAULT_CFG as any) as Configuration
  let html
  html = markdown_to_html(
    `A paragraph\n\nA second paragraph`,
    cfg
  )
  t.deepEqual(
    html,
    `A paragraph<br><br>A second paragraph`,
    'should convert paragraph breaks to `<br><br>` rather than `<p>`'
  )

  html = markdown_to_html(
    `Non-breaking newline ->\n<-, breaking newline ->  \n<-`,
    cfg
  )
  t.deepEqual(
    html,
    `Non-breaking newline ->\n&#x3C;-, breaking newline -><br>&#x3C;-`,
    'should support double space linebreaks'
  )

  html = markdown_to_html(
`Unordered list:
- One
- Two`,
    cfg
  )
  t.deepEqual(
    html,
    `Unordered list:<ul class="markdown-tight"><li>One</li><li>Two</li></ul>`,
    'should support unordered lists with tight/loose class'
  )

  html = markdown_to_html(
`Ordered list:
1. One
2. Two`,
    cfg
  )
  t.deepEqual(
    html,
`Ordered list:<ol class="markdown-tight"><li>One</li><li>Two</li></ol>`,
    'should support ordered lists with tight/loose class'
  )

  html = markdown_to_html(
`Nested list:
- One
  - Alpha
  - Bravo
- Two
- Three`,
    cfg
  )
  t.deepEqual(
    html,
`Nested list:<ul class="markdown-tight"><li>One<ul class="markdown-tight"><li>Alpha</li><li>Bravo</li></ul></li><li>Two</li><li>Three</li></ul>`,
    'nested lists should be inside "parent" `<li></li>`'
  )

  html = markdown_to_html(
`Some **bold** text`,
    cfg
  )
  t.deepEqual(
    html,
`Some <b>bold</b> text`,
    'should convert `strong` to `<b>`'
  )

  html = markdown_to_html(
`Some *italic* text`,
    cfg
  )
  t.deepEqual(
    html,
`Some <i>italic</i> text`,
    'should convert `emphasis` to `<i>`'
  )

  html = markdown_to_html(
`Some _underlined_ text`,
    cfg
  )
  t.deepEqual(
    html,
`Some <u>underlined</u> text`,
    'should support underline'
  )

  html = markdown_to_html(
`Some ^superscript^ text`,
    cfg
  )
  t.deepEqual(
    html,
`Some <sup>superscript</sup> text`,
    'should support superscript'
  )

  html = markdown_to_html(
`Some ~subscript~ text`,
    cfg
  )
  t.deepEqual(
    html,
`Some <sub>subscript</sub> text`,
    'should subscript text'
  )

  html = markdown_to_html(
`A GFM table:

| GFM   | Style |
| :---- | :---: |
| table |  with |
| cells |  rows |`,
    cfg
  )
  t.deepEqual(
    html,
`A GFM table:<table><thead><tr><th align="left">GFM</th><th align="center">Style</th></tr></thead><tbody><tr><td align="left">table</td><td align="center">with</td></tr><tr><td align="left">cells</td><td align="center">rows</td></tr></tbody></table>`,
    'should support GFM style tables'
  )
  html = markdown_to_html(
`A headerless aligned table:

| :---- | :--: |
| table | with |
| cells | rows |`,
    cfg
  )
  t.deepEqual(
    html,
`A headerless aligned table:<table><tbody><tr><td align="left">table</td><td align="center">with</td></tr><tr><td align="left">cells</td><td align="center">rows</td></tr></tbody></table>`,
    'should support headerless aligned tables'
  )

  html = markdown_to_html(
`A headerless table:

| ----- | ---- |
| table | with |
| cells | rows |`,
    cfg
  )
  t.deepEqual(
    html,
`A headerless table:<table><tbody><tr><td>table</td><td>with</td></tr><tr><td>cells</td><td>rows</td></tr></tbody></table>`,
    'should support headerless non-aligned tables'
  )

  html = markdown_to_html(
`| ------ | --------- |
| a      | table     |
| with¨a | linebreak |`,
    cfg
  )
  t.deepEqual(
    html,
`<table><tbody><tr><td>a</td><td>table</td></tr><tr><td>with<br>a</td><td>linebreak</td></tr></tbody></table>`,
    'should support trema as linebreak in table cell'
  )

  html = markdown_to_html(
`Inline media :video[\_im-media-00000000-0000-0000-0000-000000000000.webm]{auto_front auto_back loop} support`,
    cfg
  )
  t.deepEqual(
    html,
`Inline media <video id="im-media-00000000-0000-0000-0000-000000000000" src="_im-media-00000000-0000-0000-0000-000000000000.webm" class="inline-media" controls auto_front="" auto_back="" loop oncanplay="if(this.getRootNode().querySelector('anki-editable') === null &#x26;&#x26; this.offsetParent !== null &#x26;&#x26; ((this.hasAttribute('auto_front') &#x26;&#x26; !document.body.classList.contains('back')) || (this.hasAttribute('auto_back') &#x26;&#x26; document.body.classList.contains('back')))) {this.play();}" oncontextmenu="pycmd(this.id); return true;"></video>\u00A0support`,
    'should support inline media directive'
  )

  html = markdown_to_html(
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
    cfg
  )
  t.deepEqual(
    html,
`A {{c1::clozed}} word.<br><br>Clozed list: {{c2::<ul class="markdown-tight"><li>One</li><li>Two</li></ul>}}<br><br>Clozed list item:<ul class="markdown-tight"><li>{{c2::One}}</li><li>Two</li></ul>Clozed nested list:<ul class="markdown-loose"><li>One {{c3::<ul class="markdown-tight"><li>Alpha</li><li>Bravo</li></ul>}}</li><li>Two</li><li>Three</li></ul>`,
    'should support clozes'
  )

  html = markdown_to_html(
``,
    cfg
  )
  t.deepEqual(
    html,
``,
    'should support '
  )

  html = markdown_to_html(
``,
    cfg
  )
  t.deepEqual(
    html,
``,
    'should support '
  )

  html = markdown_to_html(
``,
    cfg
  )
  t.deepEqual(
    html,
``,
    'should support '
  )

  html = markdown_to_html(
``,
    cfg
  )
  t.deepEqual(
    html,
``,
    'should support '
  )

  html = markdown_to_html(CPX_MD, cfg)
  t.deepEqual(
    html,
    CPX_HTML,
    'should support complex markdown to render correctly'
  )

  t.end()
})


test('html_to_markdown', (t) => {
  const cfg = init(DEFAULT_CFG as any)
  let md = html_to_markdown(CPX_HTML, cfg)[0] //CPX_HTML
  t.deepEqual(
    md,
    CPX_MD,
    'should support complex html to be converted correctly'
  )

  t.end()
})

// These roundtrips require reasonably formated markdown
test('roundtrip', (t) => {
  const cfg = init(DEFAULT_CFG as any)
  let md = html_to_markdown(markdown_to_html(CPX_MD, cfg), cfg)[0]
  t.deepEqual(
    md,
    CPX_MD,
    'should support roundtrip of complex markdown without change'
  )

  let html = markdown_to_html(html_to_markdown(CPX_HTML, cfg)[0], cfg)
  t.deepEqual(
    html,
    CPX_HTML,
    'should support roundtrip of complex HTML without change'
  )

  t.end()
})
