/**
 * LIST HANDLERS TO HANDLE TIGHT/LOOSE CLASS
 */
import type {Element} from 'hast'
import type {List as MdastList} from 'mdast'
import type {State as MdastState} from 'mdast-util-to-hast'
import type {State as HastState} from 'hast-util-to-mdast'
import {list as hastToMdastList} from 'hast-util-to-mdast/lib/handlers/list'
import {list as mdastToHastList} from 'mdast-util-to-hast/lib/handlers/list'

function set_spread(state: HastState, list: Element, type?: 'auto'|'tight'|'loose') {
    const mdast = hastToMdastList(state, list) as MdastList
    mdast.spread = type === 'auto'
        ? mdast.spread || (list.properties?.className as string)?.includes('markdown-loose') || false
        : type === 'loose'
    return mdast
}

// Add correct class
function add_class(state: MdastState, list: MdastList, type?: 'auto'|'tight'|'loose') {
    const spread = type === 'auto'
        ? list.spread || list.children?.some(li => li.spread)
        : type === 'loose'
    const hast = mdastToHastList(state, list)
    hast.properties.className = spread ? 'markdown-loose' : 'markdown-tight'
    return hast
}

const hastToMdastListType = (type: 'auto'|'tight'|'loose') => {
    return {
        ul: (state: HastState, list: Element) => {return set_spread(state, list, type)},
        ol: (state: HastState, list: Element) => {return set_spread(state, list, type)}
    }
}

const mdastToHastListType = (type: 'auto'|'tight'|'loose') => {
    return {
        list: (state: MdastState, list: MdastList) => {return add_class(state, list, type)}
    }
}

export {hastToMdastListType, mdastToHastListType}