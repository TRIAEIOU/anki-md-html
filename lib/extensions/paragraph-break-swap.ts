import type {Parent} from 'unist'
import type {Paragraph as MdastParagraph} from 'mdast'
import type {Element as HastElement, ElementContent as HastElementContent} from 'hast'
import type {State as MdastState} from 'mdast-util-to-hast'
import type {State as HastState} from 'hast-util-to-mdast'
import {li} from './tmp-hast-to-mdast-li-bugfix'
import {paragraph as mdastParagraph} from 'mdast-util-to-hast/lib/handlers/paragraph'
import {hast_br_to_p} from '../hast_br_to_p'

// Call core handler and modify returned hast
// replacing `p-(p)` with `children - br - br - (p)`
// and `(p) - end` with `children`
function paragraphToBr(state: MdastState, nd: MdastParagraph, pt: Parent): HastElementContent[] {
    const br: HastElement = {type: 'element', tagName: 'br', children: []}
    const hast = mdastParagraph(state, nd)['children']
    let nxt = 0
    while(pt.children[nxt++] !== nd) ;
    if (nxt < pt.children.length && pt.children[nxt].type === 'paragraph')
        hast.push(br, br)
    return hast
}

const hastBrToMdastParagraph = {
    li: (state: HastState, nd: HastElement) => {
        hast_br_to_p(nd, {closeBeforeList: false, closeLast: false})
        return li(state, nd)
    }
}

const mdastParagraphToHastBr = {
    paragraph: paragraphToBr
}


export {mdastParagraphToHastBr, hastBrToMdastParagraph}