/**
 * `toMarkdown()` extension to output double space line endings for hard breaks
 * Copied from mdast-util-to-markdown/lib/handlers/break.js
 * Only change is return `  \n` instead of `\\\n`
 */
/**
 * @param {Break} _
 * @param {Parent | undefined} _1
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
export declare function _breakSpaces(_: any, _1: any, state: any, info: any): "" | " " | "  \n";
export declare const breakSpaces: {
    handlers: {
        break: typeof _breakSpaces;
    };
};
