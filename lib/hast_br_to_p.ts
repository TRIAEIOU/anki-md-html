import type {Element} from 'hast'
import {phrasing} from 'hast-util-phrasing'

/**
 * Take a node and mutate children to wrap paragraphs separated
 * by `<br><br>` in `<p>`'s instead. Used both in `li` handler
 * and "manually" called on hast root from `html_to_markdown`.
 * @param options Options
 * @param {boolean} options.closeBeforeList  Close "incomplete" text runs to paragraph when preceeding a list
 * @param {boolean} options.closeLast Close "incomplete" terminating text runs to paragraph
 *  
 */
function hast_br_to_p(nd: Element,
    options: {closeBeforeList?: boolean, closeLast?: boolean}) {
    const cds: any[] = []
    let buf: any[] = []
    let pstart = -1
    let brs = 0

    // Parse out paragraphs
    nd.children.forEach((cd, i) => {
        if (phrasing(cd)) {
            if (pstart < 0) pstart = i
            if (cd['tagName'] === 'br') brs++
            else {
                if (brs > 1) {
                    flush(true)
                    pstart = i
                }
                brs = 0
            }
            buf.push(cd)
        } else {
            if (pstart > -1)
                flush(options.closeBeforeList || nd.tagName !== 'li') 
            brs = 0
            cds.push(cd)
        }
    })
    // Handle tail paragraph
    if (pstart > -1) flush(options.closeLast)
    nd.children = cds

    // Append and reset buffer and counters
    function flush(paragraph: boolean) {
        if (paragraph)
            cds.push({
                type: 'element', tagName: 'p',
                children: buf.slice(0, brs ? -brs : undefined)
            })
        else cds.push(...buf)
        buf = [], pstart = -1
    }
}

export {hast_br_to_p}