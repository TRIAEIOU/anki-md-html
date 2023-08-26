/**
 * LIST HANDLERS TO HANDLE TIGHT/LOOSE CLASS
 */
import type { Element } from 'hast';
import type { List as MdastList } from 'mdast';
import type { State as MdastState } from 'mdast-util-to-hast';
import type { State as HastState } from 'hast-util-to-mdast';
declare function set_spread(state: HastState, list: Element): MdastList;
declare function add_class(state: MdastState, list: MdastList): Element;
declare const hastToMdastListType: {
    ul: typeof set_spread;
    ol: typeof set_spread;
};
declare const mdastToHastListType: {
    list: typeof add_class;
};
export { hastToMdastListType, mdastToHastListType };
