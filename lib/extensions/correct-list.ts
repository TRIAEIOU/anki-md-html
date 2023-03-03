import type {Element} from 'hast'
import type {List as MdastList, Parent as MdastParent} from 'mdast'
import type {State as MdastState} from 'mdast-util-to-hast'
import type {State as HastState} from 'hast-util-to-mdast'
import type {Parent as HastParent} from 'hast-util-to-mdast/lib/types'
import {list as hastToMdastList} from 'hast-util-to-mdast/lib/handlers/list'
import {list as mdastToHastList} from 'mdast-util-to-hast/lib/handlers/list'

// Correct Anki inserting nested lists between <li> and
// improve spread calculation
function correctMdastList(state: HastState, nd: Element, pt: HastParent) {
    // Fix Anki inserting nested list between <li>
    const cds = []
    nd.children.forEach((cd, i) => {
      cd = cd as Element
      if (cd.tagName === 'ul' || cd.tagName === 'ol') {
        if (i) cds[cds.length - 1].children?.push(cd)
        else cds.push({type: 'element', tagName: 'li', children: [cd]})
      } else cds.push(cd)
    })
    nd.children = cds

    const mdast = hastToMdastList(state, nd) as MdastList

    // Add basing on class
    mdast.spread ||= (nd.properties?.className as string)?.includes('markdown-loose') || false
    return mdast
}

// Add correct class
function addClass(state: MdastState, list: MdastList, pt: MdastParent) {
    const spread = list.spread || list.children?.some(li => li.spread)
    const hast = mdastToHastList(state, list)
    hast.properties.className = spread ? 'markdown-loose' : 'markdown-tight'
    return hast
}

const hastToMdastCorrectList = {
    ul: correctMdastList,
    ol: correctMdastList
}

const mdastToHastCorrectList = {
    list: addClass
}

export {hastToMdastCorrectList, mdastToHastCorrectList}