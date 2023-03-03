import type {Element} from 'hast'
import type {Content as MdastContent} from 'mdast'
import type {State as MdastState} from 'mdast-util-to-hast'
import type {State as HastState} from 'hast-util-to-mdast'
import {tableCell} from 'hast-util-to-mdast/lib/handlers/table-cell'
import {u} from 'unist-builder'

function hastToMdastTableNewline(sym: string) {
    return {
        td: newline,
        th: newline
    }

    function newline(state: HastState, nd: Element) {
        replace(nd)
        return tableCell(state, nd)

        function replace(_nd) {
            _nd?.children.forEach((__nd, i) => {
                if (__nd.tagName === 'br')
                    _nd.children[i] = u('text', sym)
                else if (__nd?.children?.length) replace(__nd)
            })
        }
    }
}

function hastCellTableNewline(cell: any, sym: string) {
    const br: Element = {type: 'element', tagName: 'br', children: []}
    replace(cell)

    function replace(nd) {
        const cds: any[] = []
        nd?.children?.forEach((_nd, i) => {
            if (_nd.type === 'text') {
                const txts = _nd.value.split(sym)
                const tlen = txts.length
                txts.forEach((txt, i) => {
                    cds.push(u('text', txt))
                    if (i !== tlen - 1) cds.push(br)
                })
            } else {
                if (_nd.children?.length) replace(_nd)
                cds.push(_nd)
            }
        })
        nd.children = cds
    }
}

export {hastToMdastTableNewline, hastCellTableNewline}