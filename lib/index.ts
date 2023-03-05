import type {Options, Configuration} from './constants'
import {TABLE_STYLE, NEWLINE, DEF_LIST, INLINE_MEDIA, MARKDOWN, EXTENSIONS, UNDERLINE, SUPERSCRIPT, SUBSCRIPT, STRIKETHROUGH} from './constants'

import type {Element as HastElement} from 'hast'
import {fromHtml as hastFromHtml} from 'hast-util-from-html'
import {toHtml as hastToHtml} from 'hast-util-to-html'
import {toMdast as hastToMdast} from 'hast-util-to-mdast'
import type {Handle as HastToMdastHandle} from 'hast-util-to-mdast'

import {fromMarkdown as markdownToMdast} from 'mdast-util-from-markdown'
import {toMarkdown as mdastToMarkdown} from 'mdast-util-to-markdown'
import {toHast as mdastToHast} from 'mdast-util-to-hast'

import {defListToMarkdown, defListFromMarkdown, defListHastHandlers} from 'mdast-util-definition-list'
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

import {breakSpaces} from './extensions/break-spaces'
import {hastToMdastListType, mdastToHastListType} from './extensions/list-type'
import {li as tmp_li_bugfix} from './extensions/tmp-hast-to-mdast-li-bugfix'
import {from_html as mutate_from_html, from_markdown as mutate_from_markdown} from './mutate_hast'


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
    const hast = hastFromHtml(html, cfg.html_to_hast)
    mutate_from_html(hast, cfg)
    const mdast = hastToMdast(hast, cfg.hast_to_mdast)
    // Strip spec mdastToMarkdown eof newline
    const md = mdastToMarkdown(mdast, cfg.mdast_to_markdown).slice(0, -1)
    return [md, parse_cloze(md)]
}

/////////////////////////////////////////////////////////////////////////////
// Convert markdown to HTML
function markdown_to_html(md: string, cfg: Configuration): string {
    if (!md) return ''

    const mdast = markdownToMdast(md, 'utf-8', cfg.markdown_to_mdast)
    const hast = <HastElement>mdastToHast(mdast, cfg.mdast_to_hast)
    mutate_from_markdown(hast, cfg)
    let html = hastToHtml(hast, cfg.hast_to_html)

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
    const mdast_hast_hdl: any[] = [mdastToHastListType]
    const hast_mdast_hdl: any[] = [hastToMdastListType, tmp_li_bugfix]
    const mdast_md_ext: any[] = []

    if (options[MARKDOWN]['hardBreak'] === "spaces")
        mdast_md_ext.push(breakSpaces)

    // Markdown extensions
    if (options[EXTENSIONS][DEF_LIST]) {
        hast_mdast_hdl.push(definitionListHastToMdast)
        mdast_hast_hdl.push(defListHastHandlers)
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
        options: {
            [NEWLINE]: options[EXTENSIONS][NEWLINE]
        },
        mdast_to_markdown: {
            ...options[MARKDOWN],
            extensions: mdast_md_ext
        },
        markdown_to_mdast: {
            extensions: md_mdast_ext,
            mdastExtensions: md_mdast_mext
        },
        mdast_to_hast: {
            handlers: flatten(mdast_hast_hdl),
            allowDangerousHtml: true
        },
        html_to_hast: {
            fragment: true
        },
        hast_to_html: {
            allowDangerousHtml: true,
            allowDangerousCharacters: true
        },
        hast_to_mdast: {
            handlers: flatten(hast_mdast_hdl) as Record<string, HastToMdastHandle>
        }
    } as Configuration

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

export {html_to_markdown, markdown_to_html, init, codes}
export type {Configuration, Options}
