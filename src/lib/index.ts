import type {Element as HastElement} from 'hast'
import {fromHtml as hastFromHtml} from 'hast-util-from-html'
import {toHtml as hastToHtml} from 'hast-util-to-html'
import {toMdast as hastToMdast} from 'hast-util-to-mdast'
import type {Handle as HastToMdastHandle} from 'hast-util-to-mdast'

import {fromMarkdown as markdownToMdast} from 'mdast-util-from-markdown'
import {toMarkdown as mdastToMarkdown} from 'mdast-util-to-markdown'
import {toHast as mdastToHast} from 'mdast-util-to-hast'
import type {Options as MdastToMarkdownOptions} from 'mdast-util-to-markdown'

import {defListToMarkdown, defListFromMarkdown, defListHastHandlers} from 'mdast-util-definition-list'
import {defListHastToMdast} from 'hast-util-definition-list'

import {xtableFromMarkdown, xtableToMarkdown} from 'mdast-util-xtable'
import {xtable} from 'micromark-extension-xtable'
// @ts-ignore lint error
import {gfmTable} from 'micromark-extension-gfm-table'

import {gfmStrikethroughFromMarkdown, gfmStrikethroughToMarkdown} from 'mdast-util-gfm-strikethrough'
import {gfmStrikethrough} from 'micromark-extension-gfm-strikethrough'
// @ts-ignore
import {attentionFromMarkdown, attentionToMarkdown, attentionFromHast} from 'mdast-util-attention'
// @ts-ignore
import {attention} from 'micromark-extension-attention'

import {directive} from 'micromark-extension-directive'
import {directiveFromMarkdown, directiveToMarkdown} from 'mdast-util-directive'
'micromark-extension-directive/lib/html'
import {inlineMediaHastHandler, inlineMediaMdastHandler} from './extensions/inline-media'

import {defList} from 'micromark-extension-definition-list'

import {breakSpaces} from './extensions/break-spaces'
import {hastToMdastListType, mdastToHastListType} from './extensions/list-type'
import {li as tmp_li_bugfix} from './extensions/tmp-hast-to-mdast-li-bugfix'

import type {Node} from "hast"
import {phrasing} from "hast-util-phrasing"

/**
 * NOTES
 * 
 * CYCLE
 * md → mdast: mdast-util-from-markdown
 * mdast → hast: mdast-util-to-hast
 * mutate_hast.from_markdown
 * hast → html: hast-util-to-html
 * html → hast: hast-util-from-html
 * mutate_hast.from_html
 * hast → mdast: mdast-util-from-hast
 * mdast → md: mdast-util-to-markdown
 * 
 * HAST MANIPULATIONS
 * Direct hast manipulations rather than extensions - mutate_hast.from_html/from_markdown
 * Run on hast before converting to mdast or HTML.
 * - Remove `\n` between html tags
 * - Replace `<br><br>` with `<p>` from HTML and vice versa
 * - Replace `<i>/<b>` with `<em>/<strong>` from HTML and vice versa
 * - Correct Anki's behaviour of inserting nested lists _outside_ `<li>` (from_html only)
 * - Correct headless table output (from_markdown only)
 * - Replace `<br>` in tables with `symbol` and vice versa (depending on config)
 * 
 * EXTENSIONS 
 * gfmStrikethrough
 * gfmTable
 * attention: super/subscript, underline (based on gfmStrikethrough)
 * xTable: headless & GFM tables (based on gfmTable)
 * defintionList
 * inlineMedia - support TRIAEIOU inline media, depends on directive extension
 * breakSpaces - render hardbreak as `  \n` instead of `\\\n`
 * listType - add markdown-tight/loose class to HTML and respect in reverse
 * tmp_li_bugfix - fix li spread calculation (minor fix in hast-util-to-mdastli.js)
 * 
 * MD → MDAST
 * breakSpaces: none
 * tmp_li_bugfix: none
 * mdast-util-from-markdown.fromMarkdown.options.extensions - syntax:
 *   gfmStrikethrough: micromark-extension-gfm-strikethrough.gfmStrikethrough()
 *   gfmTable: micromark-extension-gfm-table.gfmTable
 *   attention: micromark-extension-gfm-strikethrough#attention.attention()
 *   xtable: micromark-extension-gfm-table#xtable.xtable
 *   defList: micromark-extension-definition-list.defList
 *   inlineMedia: micromark-extension-directive.directive()
 * 
 * mdast-util-from-markdown.fromMarkdown.options.mdastExtensions - mdast insertion:
 *   gfmStrikethrough: mdast-util-gfm-strikethrough.gfmStrikethroughFromMarkdown
 *   gfmTable: mdast-util-gfm-table#xtable.xtableFromMarkdown ← both xtable & gfm
 *   attention: mdast-util-gfm-strikethrough#attention.attentionFromMarkdown()
 *   xtable: mdast-util-gfm-table#xtable.xtableFromMarkdown
 *   defList: mdast-util-definition-list#phrasing-description-handler.defListFromMarkdown
 *   inlineMedia: mdast-util-directive.directiveFromMarkdown
 * 
 * MDAST → HAST
 * gfmStrikethrough: none (hardcoded)
 * gfmTable: none (hardcoded)
 * attention: none (solved with tag names in mdast)
 * xtable: none
 * breakSpaces: none
 * tmp_li_bugfix: none
 * mdast-util-to-hast.toHast.options.handlers - hast node insertion:
 *   defList: mdast-util-defintion-list#phrasing-description-handler.defListHastHandlers
 *   inlineMedia: ./extensions/inline-media.inlineMediaMdastHandler
 *   listType: ./extensions/list-type.mdastToHastListType
 * 
 * AFTER MDAST → HAST
 * mutate_hast.from_markdown
 *  
 * HAST → HTML
 * gfmStrikethrough: none
 * gfmTable: none
 * attention: none
 * xtable: none
 * defList: none
 * breakSpaces: none
 * tmp_li_bugfix: none
 * 
 * HTML → HAST
 * gfmStrikethrough: none
 * gfmTable: none
 * attention: none
 * xtable: none
 * defList: none
 * breakSpaces: none
 * tmp_li_bugfix: none
 * 
 * AFTER HTML → HAST
 * mutate_hast.from_html
 * 
 * HAST → MDAST
 * gfmStrikethrough: none (hardcoded)
 * gfmTable: none (hardcoded)
 * xtable: none
 * breakSpaces: none
 * hast-util-to-mdast.toMdast.options.handlers - mdast node insertion:
 *   attention: mdast-util-gfm-strikethrough#attention.attentionFromHast
 *   defList: hast-util-definition-list#phrasing-description-handler.definitionListHastToMdast
 *   inlineMedia: ./extensions/inline-media.inlineMediaHastHandler
 *   listType: ./extensions/list-type.hastToMdastListType
 *   tmp_li_bugfix: ./extensions/tmp-hast-to-mdast-li-bugfix.li
 * 
 * MDAST → MD
 * tmp_li_bugfix: none
 * mdast-util-to-markdown.toMarkdown.options.extensions - render mdast nodes:
 *   gfmStrikethrough: mdast-util-gfm-strikethrough.gfmStrikethroughToMarkdown
 *   gfmTable: mdast-util-gfm-table#xtable.xtableToMarkdown ← both xtable & gfm
 *   attention: mdast-util-gfm-strikethrough#attention.attentionToMarkdown()
 *   xtable: mdast-util-gfm-table#xtable.xtableToMarkdown()
 *   defList: mdast-util-defintion-list#phrasing-description-handler.defListToMarkdown
 *   inlineMedia: mdast-util-directive.directiveToMarkdown
 *   breakSpaces: ./extensions/break-spaces.breakSpaces
 * 
 */


const TABLE = 'Tables'
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
class Converter {
  
  /////////////////////////////////////////////////////////////////////////////
  /** Properties */
  options = {[NEWLINE]: ""}
  mdast_to_markdown = {options: {}, extensions: []}
  markdown_to_mdast = {extensions: [], mdastExtensions: []}
  mdast_to_hast = {handlers: {} as Record<string, HastToMdastHandle>, allowDangerousHtml: true}
  html_to_hast = {fragment: true}
  hast_to_html = {allowDangerousHtml: true, allowDangerousCharacters: true, characterReferences: {useNamedReferences: true}}
  hast_to_mdast = {handlers: {} as Record<string, HastToMdastHandle>}

  /////////////////////////////////////////////////////////////////////////////
  /** Initialize configuration for use with mardown_to_html/html_to_markdown */
  constructor (options: Options) {
    const mdast_hast_hdl: any[] = [mdastToHastListType]
    const hast_mdast_hdl: any[] = [hastToMdastListType, tmp_li_bugfix]

    if (options[MARKDOWN]['hardBreak'] === "spaces")
        this.mdast_to_markdown.extensions.push(breakSpaces)

    // Markdown extensions
    if (options[EXTENSIONS][DEF_LIST]) {
        hast_mdast_hdl.push(defListHastToMdast)
        mdast_hast_hdl.push(defListHastHandlers)
        this.mdast_to_markdown.extensions.push(defListToMarkdown)
        this.markdown_to_mdast.extensions.push(defList)
        this.markdown_to_mdast.mdastExtensions.push(defListFromMarkdown)
    }
    if (options[EXTENSIONS][INLINE_MEDIA]) {
        hast_mdast_hdl.push(inlineMediaHastHandler)
        mdast_hast_hdl.push(inlineMediaMdastHandler)
        this.mdast_to_markdown.extensions.push(directiveToMarkdown)
        this.markdown_to_mdast.extensions.push(directive())
        this.markdown_to_mdast.mdastExtensions.push(directiveFromMarkdown)
    }

    // Tables
    if (options[EXTENSIONS][TABLE]) {
        this.markdown_to_mdast.extensions.push(options[EXTENSIONS][TABLE] === 'extended'
            ? xtable
            : gfmTable
        )
        // Always push the xtable as it contains other fixes
        this.markdown_to_mdast.mdastExtensions.push(xtableFromMarkdown)
        this.mdast_to_markdown.extensions.push(xtableToMarkdown())
    }

    // Inlines
    if (options[EXTENSIONS][STRIKETHROUGH]) {
      this.markdown_to_mdast.extensions.push(gfmStrikethrough({singleTilde: options[EXTENSIONS][STRIKETHROUGH] === 'single'}))
      this.markdown_to_mdast.mdastExtensions.push(gfmStrikethroughFromMarkdown)
      this.mdast_to_markdown.extensions.push(gfmStrikethroughToMarkdown)
    }
    if (options[EXTENSIONS][UNDERLINE]) {
        const tmp = {mdastNodeName: 'underline', hastNodeName: 'u', char: '_'}
        this.markdown_to_mdast.extensions.push(attention(tmp))
        this.markdown_to_mdast.mdastExtensions.push(attentionFromMarkdown(tmp))
        this.mdast_to_markdown.extensions.push(attentionToMarkdown(tmp))
        hast_mdast_hdl.push(attentionFromHast(tmp))
    }
    if (options[EXTENSIONS][SUPERSCRIPT]) {
        const tmp = {mdastNodeName: 'superscript', hastNodeName: 'sup', char: '^'}
        this.markdown_to_mdast.extensions.push(attention(tmp))
        this.markdown_to_mdast.mdastExtensions.push(attentionFromMarkdown(tmp))
        this.mdast_to_markdown.extensions.push(attentionToMarkdown(tmp))
        hast_mdast_hdl.push(attentionFromHast(tmp))
    }
    if (options[EXTENSIONS][SUBSCRIPT]) {
        const tmp = {mdastNodeName: 'subscript', hastNodeName: 'sub', char: '~'}
        this.markdown_to_mdast.extensions.push(attention(tmp))
        this.markdown_to_mdast.mdastExtensions.push(attentionFromMarkdown(tmp))
        this.mdast_to_markdown.extensions.push(attentionToMarkdown(tmp))
        hast_mdast_hdl.push(attentionFromHast(tmp))
    }

    this.options[NEWLINE] = options[EXTENSIONS][NEWLINE]
    Object.assign(this.mdast_to_markdown, options[MARKDOWN])
    this.mdast_to_hast.handlers = flatten(mdast_hast_hdl) as any
    this.hast_to_mdast.handlers = flatten(hast_mdast_hdl) as any

    /** Flatten array of objects into one object */
    function flatten(itms: any[]): object {
        const res = {}
        for (const itm of itms)  {
            if (typeof itm === 'function')
                res[itm.name] = itm
            else if (typeof itm === 'object')
                for (const [k, v] of Object.entries(itm)) res[k] = v
        }
        return res
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  /** Convert HTML to markdown */
  html_to_markdown(html:string): [string, number] {
    if (!html) return ['', 0]
    const hast = hastFromHtml(html, this.html_to_hast)
    this.mutate_from_html(hast)
    const mdast = hastToMdast(hast, this.hast_to_mdast)
    // Strip spec mdastToMarkdown eof newline
    const md = mdastToMarkdown(mdast, this.mdast_to_markdown).slice(0, -1)
    return [md, this.parse_cloze(md)]
  }

  /////////////////////////////////////////////////////////////////////////////
  /** Convert markdown to HTML */
  markdown_to_html(md: string): string {
    if (!md) return ''

    const mdast = markdownToMdast(md, 'utf-8', this.markdown_to_mdast)
    const hast = <HastElement>mdastToHast(mdast, this.mdast_to_hast as any)
    this.mutate_from_markdown(hast)
    let html = hastToHtml(hast, this.hast_to_html)

    return html
  }

  /////////////////////////////////////////////////////////////////////////////
  /** Parse out current cloze ordinal from string, 0 if none (i.e. increment one for next) */
  CLOZE_ORD_RE = new RegExp(String.raw`{{c(\d+)::`, 'g')
  parse_cloze(str:string): number {
      let ord: number = 0
      let match: RegExpExecArray | null
      while ((match = this.CLOZE_ORD_RE.exec(str)) !== null) {
          const o = parseInt(match[1])
          if (o > ord) ord = o
      }
      return ord
  }

  /////////////////////////////////////////////////////////////////////////////
  /**
   * MUTATE HAST
   * Run on hast before converting to mdast or HTML.
   * Issues that need to be addressed:
   * - Remove `\n` between html tags
   * - Replace `<br><br>` with `<p>` from HTML and vice versa
   * - Replace `<i>/<b>` with `<em>/<strong>` from HTML and vice versa
   * - Correct Anki's behaviour of inserting nested lists _outside_ `<li>` (from_html only)
   * - Correct headless table output (from_markdown only)
   * - Replace `<br>` in tables with `symbol` and vice versa (depending on config)
   */


  /////////////////////////////////////////////////////////////////////////////
  /**
   * Mutate hast generated from Anki style HTML to Markdown (extended)
   * compatible HTML (p-wrap, swap i for em, b for strong, table newlines etc.)
   * before conversion to mdast/markdown
   */
  mutate_from_html(hast: Node) {
      mutate(hast, {
        table_nl: this.options[NEWLINE],
        table: 0,
        headless: 0,
        list: 0,
        heading: 0,
        deflist: 0
    })

    /** Recursion function to mutate a nodes children */
    function mutate(node: Node, state: {}) {
      if (!node['children']?.length) return node
      update_state(true)

      // Mutate children
      const result: Node[] = []
      let para: Node[] = []
      let brs = 0 // number of sequential <br>'s seen

      for (const child of node['children']) {
        // discard null child and "html prettify newlines"
        if (!child || !child.position && child.type === 'text' && child['value'] === '\n') {
          continue
        }
        const tag = child['tagName']

        // phrasing
        if (phrasing(child)) {
          // keep building para until after 2+ brs
          if (tag !== 'br' && brs > 1) flush_para()

          // handle <br> including newline replacement in tables
          if (tag === 'br') {
            if (state['table'] && state['table_nl']) {
              para.push({type: 'text', value: state['table_nl']} as any)
            } else {
              para.push(child)
              brs++
            }
          } else {
            brs = 0 // reset sequential <br> counter
            // replace i/b with em/strong
            if (tag === 'i') child['tagName'] = 'em'
            else if (tag === 'b') child['tagName'] = 'strong'

            para.push(mutate(child, state))
          }
        }

        // blocks
        else {
          flush_para()

          // Move nested lists inside preceding li
          if (
            ['ul', 'ol'].includes(tag) &&
            result[result.length - 1]?.['tagName'] === 'li'
          ) {
            result[result.length - 1]['children'].push(mutate(child, state))
          }

          // unhandled, push to result
          else {
            result.push(mutate(child, state))
          }
        }
      }
      // trailing paragraph
      flush_para()
      node['children'] = result

      update_state(false)
      return node

      /** Flush paragraph buffer to result, wrapping in <p> as required */
      function flush_para() {
        if (!para.length) return
        const para_ = brs ? para.slice(0, -brs) : para

        // p wrap everywhere except: in lists w/o two <br>'s; in tables, headings or definition lists
        if (
          !phrasing(node) &&
          !state['table'] &&
          !state['heading'] &&
          !state['deflist'] &&
          ( // lists are special, to have text after a nested list in the same li
            // the outer list has to be loose in markdown, so do the reverse here (p wrap)
            !state['list'] ||
            brs > 1 ||
            ['ul', 'ol'].includes(result[result.length - 1]?.['tagName'])
          )
        )
          result.push({
            type: 'element',
            tagName: 'p',
            children: para_
          } as any)
        else result.push(...para_)

        para = []
        brs = 0
      }

      /** Incr/decr counters of block levels */
      function update_state(increment: boolean) {
        if (node['tagName'] === 'table')
          state['table'] += increment ? 1 : -1
        else if (['ul', 'ol'].includes(node['tagName']))
          state['list'] += increment ? 1 : -1
        else if(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node['tagName']))
          state['heading'] += increment ? 1 : -1
        else if(node['tagName'] === 'dl')
          state['deflist'] += increment ? 1 : -1
      }
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  /**
   * Mutate hast Markdown (extended) style to Anki compatible style before
   * conversion to HTML (p-unwrap, swap em for i, strong for b, table newlines etc.)
   */
  mutate_from_markdown(hast: Node) {
    const br = {type: 'element', tagName: 'br'}
    mutate(hast, {
      table_nl: this.options[NEWLINE],
      table: 0,
      list: 0,
      headless: 0
    })

    function mutate(node: Node, state: {}) {
      if (!node['children']?.length) return node
      update_state(true)

      // Mutate children
      const result: Node[] = []
      let prv // preceding child or undef

      // Direct children
      let i = -1
      for (const child of node['children']) {
        i++
        // discard null child and "html prettify newlines"
        if (!child || !child.position && child.type === 'text' && child['value'] === '\n') {
          continue
        }
        const tag = child['tagName']

        // phrasing
        if (phrasing(child)) {
          if (state['table'] && child.type === 'text' && child.value.includes(state['table_nl'])) {
            const txts = child.value.split(new RegExp(`(?<!\\\\)[${state['table_nl']}]`))
            let n = 0
            for (const txt of txts) {
              if (txt) result.push({type: 'text', value: txt} as any)
              if (n++ < txts.length - 1) result.push(br)
            }
          } else {
            // replace i/b with em/strong
            if (tag === 'em') child['tagName'] = 'i'
            else if (tag === 'strong') child['tagName'] = 'b'

            result.push(mutate(child, state))
          }
        }
        
        // blocks
        else {
          // paragraph, preced with <br><br> as needed
          if (tag === 'p') {
            if (prv && (prv['tagName'] === 'p' || prv.type === 'text'))
              result.push(br, br)
            result.push(...mutate(child, state)['children'])
          }

          // Fix headless tables
          else if (state['headless']) {
            // Move thead rows to tbody, they will be handled there
            if (tag === 'thead') {
              let n = i + 1
              while (node['children'][n]['tagName'] !== 'tbody') n++
              node['children'][n]['children'].unshift(...child['children'])
            } else {
              // Convert any th to td
              if (tag === 'th') child['tagName'] = 'td'
              result.push(mutate(child, state))
            }
          }
          
          // non-para, push to result
          else {
            result.push(mutate(child, state))
          }
        }

        prv = child
      }

      node['children'] = result
      // ugly here but clear table headless property
      if (node['tagName'] === 'table' && node['properties']['headless'])
        delete node['properties']['headless']
      update_state(false)
      return node

      /** Incr/decr counters of block levels */
      function update_state(increment: boolean) {
        if (node['tagName'] === 'table') {
          state['table'] += increment ? 1 : -1
          if (node['properties']['headless'])
            state['headless'] += increment ? 1 : -1
        }
        else if (['ul', 'ol'].includes(node['tagName']))
          state['list'] += increment ? 1 : -1
        else if(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node['tagName']))
          state['heading'] += increment ? 1 : -1
      }
    }
  }

}

export {Converter}
export type {Options}
