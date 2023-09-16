/**
 * LIST HANDLERS TO HANDLE TIGHT/LOOSE CLASS
 */
import type {Element, Node} from 'hast'
import type {List as MdastList} from 'mdast'
import type {State as MdastState} from 'mdast-util-to-hast'
import type {State as HastState} from 'hast-util-to-mdast'
import {list as hastToMdastList} from 'hast-util-to-mdast/lib/handlers/list'
import {list as mdastToHastList} from 'mdast-util-to-hast/lib/handlers/list'

const tightenLists = (left: Node, right: Node, parent: Node, state: MdastState )
: number|boolean|undefined =>
{
    // Remove leading space for lists following paragraphs or nested
    if (left.type === 'paragraph' && right.type === 'list' && !right['spread'])
        return 0
    // Default action
}

function set_spread(state: HastState, list: Element) {
  const mdast = hastToMdastList(state, list) as MdastList
  mdast.spread ||= (list.properties?.className as string)?.includes('markdown-loose') || false
  return mdast
}

// Add correct class
function add_class(state: MdastState, list: MdastList) {
    const spread = list.spread || list.children?.some(li => li.spread)
    const hast = mdastToHastList(state, list)
    hast.properties.className = spread ? 'markdown-loose' : 'markdown-tight'
    return hast
}

const hastToMdastListType = {
    ul: set_spread,
    ol: set_spread
}

const mdastToHastListType = {
    list: add_class
}

export {hastToMdastListType, mdastToHastListType, tightenLists}