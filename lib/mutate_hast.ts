/**
 * MUTATE HAST FROM HTML
 * Run on hast before converting to mdast or HTML.
 * Issues that need to be addressed:
 * - Remove `\n` between html tags
 * - Replace `<br><br>` with `<p>` from HTML and vice versa
 * - Replace `<i>/<b>` with `<em>/<strong>` from HTML and vice versa
 * - Correct Anki's behaviour of inserting nested lists _outside_ `<li>` (from_html only)
 * - Replace `<br>` in tables with `symbol` and vice versa (depending on config)
 */

import {Node, Element, ElementContent} from "hast"
import {Options} from "./index"
import {phrasing} from "hast-util-phrasing"

/** Mutate hast generated from HTML before conversion to mdast/markdown */
function from_html(hast: Node, options: Options) {
  mutate(hast, {
    ...options,
    in_cell: false
  })

  function mutate(node: Node, state: {}) {
    const result: Node[] = []

    // Mutate children
    if (node['children']) {
      let brs = 0 // number of sequential <br>'s seen
      let pstart = -1 // index in _result_ of potential paragraph start

      for (const [i, child] of node['children'].entries()) {
        const tag = child['tagName']
        if (pstart < 0 && phrasing(child)) pstart = result.length - 1

        // discard "HTML pretty newlines"
        if (!child.position && child.type === 'text' && child['value'] === '\n') {
          continue
        }

        /////////////////////////// new if-else block

        // replace newlines in table cells - has to happen before <br><br>-<p>
        if (tag === 'br' && state['in_cell'] && state['table_nl']) {
          result.push({type: 'text', value: state['table_nl']} as any)
        }
        
        // replace <br><br>+ with <p> - table cell replacement has already been done
        // needs to happen before handling the current tag
        else if (pstart > -1 && (
          (!phrasing(child) || (tag !== 'br' && brs > 1)) ||
          (i === node['children'].length - 1 && node.type === 'root') // special case: wrap root tail in p
        )) {
          const paragraph = result.splice(pstart)
          result.push({
            type: 'element',
            tagName: 'p',
            children: paragraph.slice(0, -brs)
          } as any)
          // note: children not yet mutated but array var is a ref so will be mutated later
          brs = 0, pstart = -1
        }

        /////////////////////////// new if-else block

        // replace i/b with em/strong
        if (tag === 'i') {
          child['tagName'] = 'em'
          result.push(child)
        } else if (tag === 'b') {
          child['tagName'] = 'strong'
          result.push(child)
        }
        
        // move nested lists inside preceding li
        else if (
          ['ul', 'ol'].includes(tag) &&
          result.length && result[result.length - 1]['tagName'] === 'li'
        ) {
          result[result.length - 1]['children'].push(child)
          // note: children not yet mutated but array var is a ref so will be mutated later
        }
        
        // count up brs as needed
        else if (tag === 'br') {
          brs++
          result.push(child)
        }
        
        // unhandled, push to result
        else {
          result.push(child)
        }

        /////////////////////////// new if-else block

        // if non-phrasing, reset brs and pstart
        if (!phrasing(child)) {
          brs = 0, pstart = -1
        }

        /////////////////////////// new if-else block

        // Recurse children
        if (child['children']) {
          const state_ = {
            ...state,
            in_table: state['in_table'] || ['th', 'td'].includes(tag)
          }
          mutate(child, state_)
        }
      }

      node['children'] = result
    }
  }
}


/** Mutate hast generated from markdown/mdast before conversion to HTML */
function from_markdown(hast: Node, options: Options) {
  const br = {type: 'element', tag: 'br'}
  mutate(hast, {
    ...options,
    in_cell: false
  })

  function mutate(node: Node, state: {}) {
    const result: Node[] = []

    // Mutate children
    if (node['children']) {

      // Direct children
      for (const [i, child] of node['children'].entries()) {
        const tag = child['tagName']

        // discard "HTML pretty newlines"
        if (!child.position && child.type === 'text' && child['value'] === '\n') {
          continue
        }

        /////////////////////////// new if-else block

        // replace newlines in table cells
        if (state['in_cell'] && child.type === 'text' && child.value.includes(state['table_nl'])) {
          const txts = child.value.split(new RegExp(`(?<!\\)(?:(\\\\)*)[${state['table_nl']}]`))
          for (const [n, txt] of txts) {
            if (txt.value) result.push({type: 'text', value: txt} as any)
            if (n < txts.length - 1) result.push(br)
          }
        }
        
        // replace <p> with <br><br>
        else if (tag === 'p') {
          result.push(...child.children, br, br)
        }

        // replace i/b with em/strong
        if (tag === 'em') {
          child['tagName'] = 'i'
          result.push(child)
        } else if (tag === 'strong') {
          child['tagName'] = 'b'
          result.push(child)
        }
        
        // Recurse children
        if (child['children']) {
          const state_ = {
            ...state,
            in_table: state['in_table'] || ['th', 'td'].includes(tag)
          }
          mutate(child, state_)
        }
      }

      node['children'] = result
    }
  }
}

export {from_html, from_markdown}
