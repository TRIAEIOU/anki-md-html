/**
 * @param {State} state
 *   State.
 * @param {Element} node
 *   hast element to transform.
 * @returns {ListItem}
 *   mdast node.
 */
export function li(state: State, node: Element): ListItem;
export type Element = import('hast').Element;
export type ListItem = import('mdast').ListItem;
/**
 * // CHANGE
 */
export type State = import('hast-util-to-mdast/lib/state.js').State;
