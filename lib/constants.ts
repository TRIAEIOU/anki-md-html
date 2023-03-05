import type {Options as HtmlToHastOptions} from 'hast-util-from-html'
import type {Options as HastToHtmlOptions} from 'hast-util-to-html'
import type {Options as MarkdownToMdastOptions} from 'mdast-util-from-markdown'
import type {Options as MdastToMarkdownOptions} from 'mdast-util-to-markdown'
import type {Options as MdastToHastOptions} from 'mdast-util-to-hast'
import type {Options as HastToMdastOptions} from 'hast-util-to-mdast'


const TABLE_STYLE = 'Tables'
const NEWLINE = 'Table newline'
const DEF_LIST = 'Definition lists'
const INLINE_MEDIA = 'Inline media'
const MARKDOWN = 'Markdown format'
const EXTENSIONS = 'Markdown extensions'
const UNDERLINE = "Underline"
const SUPERSCRIPT = "Superscript"
const SUBSCRIPT = "Subscript"
const STRIKETHROUGH = "Strikethrough"

interface Options {
  [MARKDOWN]: MdastToMarkdownOptions
  [EXTENSIONS]: object
}
interface Configuration {
  options: object
  mdast_to_markdown: MdastToMarkdownOptions
  markdown_to_mdast: MarkdownToMdastOptions
  mdast_to_hast: MdastToHastOptions
  hast_to_html: HastToHtmlOptions
  html_to_hast: HtmlToHastOptions
  hast_to_mdast: HastToMdastOptions
}

export type {HtmlToHastOptions, HastToHtmlOptions, MarkdownToMdastOptions, MdastToMarkdownOptions, MdastToHastOptions, HastToMdastOptions, Options, Configuration}
export {TABLE_STYLE, NEWLINE, DEF_LIST, INLINE_MEDIA, MARKDOWN, EXTENSIONS, UNDERLINE, SUPERSCRIPT, SUBSCRIPT, STRIKETHROUGH}
