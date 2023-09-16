/**
 * @param {ListItem} node
 * @param {Parents | undefined} parent
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
export function listItem(node: ListItem, parent: Parents | undefined, state: State, info: Info): string;
/**
 * //@typedef {import('mdast').Parents} Parents
 */
export type ListItem = import('mdast').ListItem;
export type Parents = any;
export type Info = import('mdast-util-to-markdown/lib/types.js').Info;
export type Map = import('mdast-util-to-markdown/lib/types.js').Map;
export type State = import('mdast-util-to-markdown/lib/types.js').State;
