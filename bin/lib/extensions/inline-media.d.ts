/**
 * Handle TRIAEIOU Anki inline media (`<audio>/<video>`) as markdown directives
 */
import type { Content as MdastContent } from 'mdast';
import type { State as HastState } from 'hast-util-to-mdast';
import type { State as MdastState } from 'mdast-util-to-hast';
import type { Directive } from 'micromark-extension-directive/lib/html';
/**
 * Micromark HTML extension implementation to convert inline media (audio/video)
 * directive to HTML
 * @param {Directive} d
 * @returns
 */
declare function mdastToHtml(d: Directive): boolean;
/**
 * Micromark HTML extension implementation to convert inline media (audio/video)
 * directive to HTML, spread in directiveHtml({}) in micromark htmlExtensions
 * @returns
 */
declare const inlineMediaHtml: {
    audio: typeof mdastToHtml;
    video: typeof mdastToHtml;
};
/**
 * Convert inline media (audio/video) hast node to mdast
 */
declare function hastToMdast(state: HastState, node: any): void | MdastContent | MdastContent[];
/**
 * Convert inline media (audio/video) mdast node to hast
 */
declare function mdastToHast(state: MdastState, node: any): import("hast").ElementContent[] | {
    type: any;
    tagName: any;
    properties: any;
    children: any[];
};
/**
 * hast handler for converting inline media (audio/video) directives
 * to mdast node, spread in toMdast handlers
 */
declare const inlineMediaHastHandler: {
    audio: typeof hastToMdast;
    video: typeof hastToMdast;
};
/**
 * mdast handler for converting inline media (audio/video) directives
 * to hast node, spread in toHast handlers
 */
declare const inlineMediaMdastHandler: {
    textDirective: typeof mdastToHast;
};
export { inlineMediaHtml, inlineMediaHastHandler, inlineMediaMdastHandler };
