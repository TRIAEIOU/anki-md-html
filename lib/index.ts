import {remove} from 'unist-util-remove'

import type {Element as HastElement, Node as HastNode} from 'hast'
import {fromHtml as hastFromHtml} from 'hast-util-from-html'
import type {Options as HtmlToHastOptions} from 'hast-util-from-html'
import {toHtml as hastToHtml} from 'hast-util-to-html'
import type {Options as HastToHtmlOptions} from 'hast-util-to-html'
import {toMdast as hastToMdast} from 'hast-util-to-mdast'
import type {Options as HastToMdastOptions, Handle as HastToMdastHandle} from 'hast-util-to-mdast'

import {fromMarkdown as markdownToMdast} from 'mdast-util-from-markdown'
import type {Options as MarkdownToMdastOptions} from 'mdast-util-from-markdown'
import {toMarkdown as mdastToMarkdown} from 'mdast-util-to-markdown'
import type {Options as MdastToMarkdownOptions} from 'mdast-util-to-markdown'
import {toHast as mdastToHast} from 'mdast-util-to-hast'
import type {Options as MdastToHastOptions} from 'mdast-util-to-hast'

import {defListToMarkdown, defListFromMarkdown, mdastDefList2hast, mdastDefListTerm2hast, mdastDefListDescription2hast} from 'mdast-util-definition-list'
import {definitionListHastToMdast} from 'hast-util-definition-list'

import {xtableFromMarkdown, xtableToMarkdown} from 'mdast-util-xtable'
import {xtable} from 'micromark-extension-xtable'
// @ts-ignore lint error
import {gfmTable} from 'micromark-extension-gfm-table'

import {gfmStrikethroughFromMarkdown, gfmStrikethroughToMarkdown} from 'mdast-util-gfm-strikethrough'
import {gfmStrikethrough} from 'micromark-extension-gfm-strikethrough'
// @ts-ignore
import {attentionFromMarkdown, attentionToMarkdown} from 'mdast-util-attention'
// @ts-ignore
import {attention, codes} from 'micromark-extension-attention'

import {directive} from 'micromark-extension-directive'
import {directiveFromMarkdown, directiveToMarkdown} from 'mdast-util-directive'
'micromark-extension-directive/lib/html'
import {inlineMediaHastHandler, inlineMediaMdastHandler} from './extensions/inline-media'

import {defList} from 'micromark-extension-definition-list'

import {emStrongToIB, iBToEmStrong} from './extensions/em-strong-swap-i-b'
import {breakSpaces} from './extensions/break-spaces'
import {mdastParagraphToHastBr, hastBrToMdastParagraph} from './extensions/paragraph-break-swap'
import {hastToMdastCorrectList, mdastToHastCorrectList} from './extensions/correct-list'
import { Text } from 'hast'
import { hast_br_to_p } from './hast_br_to_p'
import {li as tmp_li_bugfix} from './extensions/tmp-hast-to-mdast-li-bugfix'

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
declare type Options = {
    [MARKDOWN]: MdastToMarkdownOptions
    [EXTENSIONS]: object
}
declare type Configuration = {
    mdast_to_markdown: {options: MdastToMarkdownOptions}
    markdown_to_mdast: {options: MarkdownToMdastOptions}
    mdast_to_hast: {
        options: MdastToHastOptions,
        hast_transform: (hast: HastElement) => void
    }
    hast_to_html: {options: HastToHtmlOptions}
    html_to_hast: {options: HtmlToHastOptions}
    hast_to_mdast: {
        options: HastToMdastOptions
        hast_transform: (hast: HastElement) => void
    }
}

/**
 * NOTES REGARDING UNIFIED
 * Conversion MD → HTML:
 * 1. mdast-util-from-markdown
 *      - Parsing markdown: micromark syntax extension ("extension")
 *          mdast-hast-extension-inline-factory to generate inlines (depends on mdast-util-gfm-strikethrough#inline-factory)
 *      - Inserting in mdast: mdast-util-from-markdown mdastExtension ("extensionFromMarkdown")
 *      gfm+xtable, deflist, directive (video/audio)
 * 2. mdast-util-to-hast - use mdast handlers
 *      table-newline, emtostrongitalic, paragraptobreak, fixlist
 * 3. hast-util-to-html
 *
 * Conversion HTML → MD:
 * 1. hast-util-from-html
 * 2. hast-util-to-mdast - use hast handlers
 *      table-newline, strongitalictoem, brtoparagraph, fix-anki-nested-lists,
 * 3. mdast-util-to-markdown - use mdast extensions
 *     gfm+xtable, deflist, directive (video/audio), linebreak-spaces
 */

/////////////////////////////////////////////////////////////////////////////
// Parse out current cloze ordinal from string, 0 if none (i.e. increment one for next)
const CLOZE_ORD_RE = new RegExp(String.raw`{{c(\d+)::`, 'g')
function parse_cloze(str:string): number {
    let ord: number = 0
    let match: RegExpExecArray | null
    while ((match = CLOZE_ORD_RE.exec(str)) !== null) {
        const o = parseInt(match[1])
        if (o > ord) ord = o
    }
    return ord
}

/////////////////////////////////////////////////////////////////////////////
// Convert HTML to markdown
function html_to_markdown(html:string, cfg: Configuration): [string, number] {
    if (!html) return ['', 0]
    const hast = hastFromHtml(html, cfg.html_to_hast.options)
    hast_br_to_p(hast as any, {closeBeforeList: false, closeLast: false})
    cfg.hast_to_mdast.hast_transform(hast as any)
    const mdast = hastToMdast(hast, cfg.hast_to_mdast.options)
    // Strip spec mdastToMarkdown eof newline
    const md = mdastToMarkdown(mdast, cfg.mdast_to_markdown.options).slice(0, -1)
    return [md, parse_cloze(md)]
}

/////////////////////////////////////////////////////////////////////////////
// Convert markdown to HTML
function markdown_to_html(md: string, cfg: Configuration): string {
    if (!md) return ''

    const mdast = markdownToMdast(md, 'utf-8', cfg.markdown_to_mdast.options)
    const hast = <HastElement>mdastToHast(mdast, cfg.mdast_to_hast.options)
    cfg.mdast_to_hast.hast_transform(hast)
    let html = hastToHtml(hast, cfg.hast_to_html.options)

    return html
}

/**
 * Initialize configuration for use with mardown_to_html/html_to_markdown
 * @param {Options} options
 * @returns configuration
 */
function init(options: Options): Configuration {
    const md_mdast_ext: any[] = []
    const md_mdast_mext: any[] = []
    const mdast_hast_hdl: any[] = [emStrongToIB, mdastParagraphToHastBr, mdastToHastCorrectList]
    const hast_mdast_hdl: any[] = [iBToEmStrong, hastBrToMdastParagraph, hastToMdastCorrectList]
    const mdast_md_ext: any[] = []

    if (options[MARKDOWN]['hardBreak'] === "spaces")
        mdast_md_ext.push(breakSpaces)

    // Markdown extensions
    if (options[EXTENSIONS][DEF_LIST]) {
        hast_mdast_hdl.push(definitionListHastToMdast.dl, definitionListHastToMdast.dt, definitionListHastToMdast.dd)
        mdast_hast_hdl.push(mdastDefList2hast, mdastDefListTerm2hast, mdastDefListDescription2hast)
        mdast_md_ext.push(defListToMarkdown)
        md_mdast_ext.push(defList)
        md_mdast_mext.push(defListFromMarkdown)
    }
    if (options[EXTENSIONS][INLINE_MEDIA]) {
        hast_mdast_hdl.push(inlineMediaHastHandler)
        mdast_hast_hdl.push(inlineMediaMdastHandler)
        mdast_md_ext.push(directiveToMarkdown)
        md_mdast_ext.push(directive())
        md_mdast_mext.push(directiveFromMarkdown)
    }

    // Tables
    if (options[EXTENSIONS][TABLE_STYLE] !== 'none') {
        md_mdast_ext.push(options[EXTENSIONS][TABLE_STYLE] === 'extended'
            ? xtable
            : gfmTable
        )
        md_mdast_mext.push(xtableFromMarkdown)
        mdast_md_ext.push(xtableToMarkdown())
    }

    // Table cell newlines
    // Current mdast-util-to-hast implementation never calls table-cell handler
    let mdast_hast_transform
    let hast_mdast_transform
    if (options[EXTENSIONS][TABLE_STYLE] !== 'none' && options[EXTENSIONS][NEWLINE]) {
        const br: HastElement = {type: 'element', tagName: 'br', children: []}
        mdast_hast_transform = function traverse(nd: HastNode, cell = false) {
            const children = []
            for (const child of nd['children']) {
                if (child.type === 'text') {
                    if (!child.position && child['value'] === '\n')
                        continue
                    const txts = child['value'].split(options[EXTENSIONS][NEWLINE])
                    for (let i = 0; i < txts.length; i++) {
                        children.push({type: 'text', value: txts[i]})
                        if (i < (txts.length - 1)) children.push(br)
                    }
                } else {
                    if (child.children && child.children.length)
                        traverse(child, child.tagName === 'td' || child.tagName === 'th' || cell)
                    children.push(child)
                }
            }
            if (children.length)
                nd['children'] = children
        }
        const nl: Text = {type: 'text', value: options[EXTENSIONS][NEWLINE]}
        hast_mdast_transform = function traverse(nd: HastNode, cell = false) {
            const children = []
            for (let i = 0; i < children.length; i++) {
                if (children[i].tagName === 'br') children[i] = nl
                else for (const child of children[i].children)
                    traverse(child, child.tagName === 'td' || child.tagName === 'th' || cell)
            }
        }
    } else {
        mdast_hast_transform = function (hast) {
            return remove(hast, (nd) => {
                return !nd.position && nd.type === 'text' && nd['value'] === '\n'
            })
        }
        // hast_mdast_transform = undefined
    }

    // Inlines
    if (options[EXTENSIONS][UNDERLINE]) {
        const tmp = {mdastNodeName: 'underline', hastNodeName: 'u', code: codes.underscore}
        md_mdast_ext.push(attention(tmp))
        md_mdast_mext.push(attentionFromMarkdown(tmp))
        mdast_md_ext.push(attentionToMarkdown(tmp))
    }
    if (options[EXTENSIONS][SUPERSCRIPT]) {
        const tmp = {mdastNodeName: 'superscript', hastNodeName: 'sup', code: codes.caret}
        md_mdast_ext.push(attention(tmp))
        md_mdast_mext.push(attentionFromMarkdown(tmp))
        mdast_md_ext.push(attentionToMarkdown(tmp))
    }
    if (options[EXTENSIONS][SUBSCRIPT]) {
        const tmp = {mdastNodeName: 'subscript', hastNodeName: 'sub', code: codes.tilde}
        md_mdast_ext.push(attention(tmp))
        md_mdast_mext.push(attentionFromMarkdown(tmp))
        mdast_md_ext.push(attentionToMarkdown(tmp))
    }
    if (options[EXTENSIONS][STRIKETHROUGH]) {
        md_mdast_ext.push(gfmStrikethroughFromMarkdown)
        md_mdast_mext.push(gfmStrikethrough({singleTilde: options[EXTENSIONS][STRIKETHROUGH] !== 'double'}))
        mdast_md_ext.push(attentionToMarkdown(gfmStrikethroughToMarkdown))
    }


    return {
        mdast_to_markdown: {
            options: {
                ...options[MARKDOWN],
                extensions: mdast_md_ext
            }
        },
        markdown_to_mdast: {
            options: {
                extensions: md_mdast_ext,
                mdastExtensions: md_mdast_mext
            }
        },
        mdast_to_hast: {
            options: {
                handlers: flatten(mdast_hast_hdl),
                allowDangerousHtml: true
            },
            hast_transform: mdast_hast_transform
        },
        html_to_hast: {
            options: {
                fragment: true
            }
        },
        hast_to_html: {
            options: {
                allowDangerousHtml: true,
                allowDangerousCharacters: true
            }
        },
        hast_to_mdast: {
            options: {
                handlers: flatten(hast_mdast_hdl) as Record<string, HastToMdastHandle>
            },
            hast_transform: hast_mdast_transform
        }
    } as Configuration

    /** Flatten array of objects into one object */
    function flatten(objects: object[]): object {
        const res = {}
        for (const obj of objects)
            for (const [k, v] of Object.entries(obj)) res[k] = v
        return res
    }
}

export {html_to_markdown, markdown_to_html, init, codes}
export type {Configuration, Options}
