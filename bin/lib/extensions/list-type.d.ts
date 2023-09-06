/**
 * LIST HANDLERS TO HANDLE TIGHT/LOOSE CLASS
 */
import type { Element } from 'hast';
import type { List as MdastList } from 'mdast';
import type { State as MdastState } from 'mdast-util-to-hast';
import type { State as HastState } from 'hast-util-to-mdast';
declare const hastToMdastListType: (type: 'auto' | 'tight' | 'loose') => {
    ul: (state: HastState, list: Element) => MdastList;
    ol: (state: HastState, list: Element) => MdastList;
};
declare const mdastToHastListType: (type: 'auto' | 'tight' | 'loose') => {
    list: (state: MdastState, list: MdastList) => Element;
};
export { hastToMdastListType, mdastToHastListType };
