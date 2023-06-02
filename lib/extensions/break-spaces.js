/**
 * `toMarkdown()` extension to output double space line endings for hard breaks
 * Copied from mdast-util-to-markdown/lib/handlers/break.js
 * Only change is return `  \n` instead of `\\\n`
 */
/**
 * @typedef {import('mdast').Break} Break
 * @typedef {import('../types.js').Parent} Parent
 * @typedef {import('../types.js').State} State
 * @typedef {import('../types.js').Info} Info
 */
import { patternInScope } from 'mdast-util-to-markdown/lib/util/pattern-in-scope.js';
/**
 * @param {Break} _
 * @param {Parent | undefined} _1
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
export function _breakSpaces(_, _1, state, info) {
    let index = -1;
    while (++index < state.unsafe.length) {
        // If we can’t put eols in this construct (setext headings, tables), use a
        // space instead.
        if (state.unsafe[index].character === '\n' &&
            patternInScope(state.stack, state.unsafe[index])) {
            return /[ \t]/.test(info.before) ? '' : ' ';
        }
    }
    return '  \n';
}
export const breakSpaces = {
    handlers: {
        break: _breakSpaces
    }
};
