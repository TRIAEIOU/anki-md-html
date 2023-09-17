/**
 * Tighten headings
 */
import type { Node } from 'hast';
import type { State as MdastState } from 'mdast-util-to-hast';
declare const tightenHeadings: (level: number) => (left: Node, right: Node, parent: Node, state: MdastState) => number | boolean | undefined;
export { tightenHeadings };
