# anki-md-html

Provides Anki style html → markdown and vice versa using [`unifiedjs`](https://unifiedjs.com).

Exports class `Converter` with methods `html_to_markdown(html: string): string` and `markdown_to_html(md: string): string`.

## Changelog

- 230826: `html_to_markdown` now only returns the markdown string (earlier returned array of `[markdown, ordinal]`), added config options `tightenLists` (when `true` removes empty line before tight lists) and `listItemIndentLeadOnly` (when `true` in conjunction with `listItemIndent`: `"tab"` will indent list items at multiples of 4 spaces but one space afte the bullet).