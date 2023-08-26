import type { Options as MdastToMarkdownOptions } from 'mdast-util-to-markdown';
import type { Node } from "hast";
declare const MARKDOWN = "Markdown format";
declare const EXTENSIONS = "Markdown extensions";
interface Options {
    [MARKDOWN]: MdastToMarkdownOptions;
    [EXTENSIONS]: object;
}
declare class Converter {
    /** Properties */
    options: {
        "Table newline": string;
    };
    mdast_to_markdown: {
        options: {};
        extensions: any[];
    };
    markdown_to_mdast: {
        extensions: any[];
        mdastExtensions: any[];
    };
    mdast_to_hast: {
        handlers: Record<string, import("hast-util-to-mdast/lib/types").Handle>;
        allowDangerousHtml: boolean;
    };
    html_to_hast: {
        fragment: boolean;
    };
    hast_to_html: {
        allowDangerousHtml: boolean;
        allowDangerousCharacters: boolean;
        characterReferences: {
            useNamedReferences: boolean;
        };
    };
    hast_to_mdast: {
        handlers: Record<string, import("hast-util-to-mdast/lib/types").Handle>;
    };
    /** Initialize configuration for use with markdown_to_html/html_to_markdown */
    constructor(options: Options);
    /** Convert HTML to markdown */
    html_to_markdown(html: string): string;
    /** Convert markdown to HTML */
    markdown_to_html(md: string): string;
    /** Parse out current cloze ordinal from string, 0 if none (i.e. increment one for next) */
    CLOZE_ORD_RE: RegExp;
    parse_cloze(str: string): number;
    /**
     * MUTATE HAST
     * Run on hast before converting to mdast or HTML.
     * Issues that need to be addressed:
     * - Remove `\n` between html tags
     * - Replace `<br><br>` with `<p>` from HTML and vice versa
     * - Replace `<i>/<b>` with `<em>/<strong>` from HTML and vice versa
     * - Correct Anki's behaviour of inserting nested lists _outside_ `<li>` (from_html only)
     * - Correct headless table output (from_markdown only)
     * - Replace `<br>` in tables with `symbol` and vice versa (depending on config)
     */
    /**
     * Mutate hast generated from Anki style HTML to Markdown (extended)
     * compatible HTML (p-wrap, swap i for em, b for strong, table newlines etc.)
     * before conversion to mdast/markdown
     */
    mutate_from_html(hast: Node): void;
    /**
     * Mutate hast Markdown (extended) style to Anki compatible style before
     * conversion to HTML (p-unwrap, swap em for i, strong for b, table newlines etc.)
     */
    mutate_from_markdown(hast: Node): void;
}
export { Converter };
export type { Options };
