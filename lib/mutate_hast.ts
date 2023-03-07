/**
 * MUTATE HAST FROM HTML
 * Run on hast before converting to mdast or HTML.
 * Issues that need to be addressed:
 * - Remove `\n` between html tags
 * - Replace `<br><br>` with `<p>` from HTML and vice versa
 * - Replace `<i>/<b>` with `<em>/<strong>` from HTML and vice versa
 * - Correct Anki's behaviour of inserting nested lists _outside_ `<li>` (from_html only)
 * - Correct headless table output (from_markdown only)
 * - Replace `<br>` in tables with `symbol` and vice versa (depending on config)
 */

import type {Configuration} from "./constants"
import {EXTENSIONS, NEWLINE} from "./constants"
import type {Node} from "hast"
import {phrasing} from "hast-util-phrasing"

/** Mutate hast generated from HTML before conversion to mdast/markdown */
function from_html(hast: Node, cfg: Configuration) {
  mutate(hast, {
    table_nl: cfg.options[NEWLINE],
    table: 0,
    headless: 0,
    list: 0,
    heading: 0
  })

  /** Recursion function to mutate a nodes children */
  function mutate(node: Node, state: {}) {
    if (!node['children']?.length) return node
    update_state(true)

    // Mutate children
    const result: Node[] = []
    let para: Node[] = []
    let brs = 0 // number of sequential <br>'s seen

    for (const child of node['children']) {
      // discard null child and "html prettify newlines"
      if (!child || !child.position && child.type === 'text' && child['value'] === '\n') {
        continue
      }
      const tag = child['tagName']

      // phrasing
      if (phrasing(child)) {
        // keep building para until after 2+ brs
        if (tag !== 'br' && brs > 1) flush_para()

        // handle <br> including newline replacement in tables
        if (tag === 'br') {
          if (state['table'] && state['table_nl']) {
            para.push({type: 'text', value: state['table_nl']} as any)
          } else {
            para.push(child)
            brs++
          }
        } else {
          brs = 0 // reset sequential <br> counter
          // replace i/b with em/strong
          if (tag === 'i') child['tagName'] = 'em'
          else if (tag === 'b') child['tagName'] = 'strong'

          para.push(mutate(child, state))
        }
      }

      // blocks
      else {
        flush_para()

        // Move nested lists inside preceding li
        if (
          ['ul', 'ol'].includes(tag) &&
          result[result.length - 1]?.['tagName'] === 'li'
        ) {
          result[result.length - 1]['children'].push(mutate(child, state))
        }

        // unhandled, push to result
        else {
          result.push(mutate(child, state))
        }
      }
    }
    // trailing paragraph
    flush_para()
    node['children'] = result

    update_state(false)
    return node

    /** Flush paragraph buffer to result, wrapping in <p> as required */
    function flush_para() {
      if (!para.length) return
      const para_ = brs ? para.slice(0, -brs) : para

      // p wrap everywhere except: in lists w/o two <br>'s; in tables or headings
      if (
        !phrasing(node) &&
        !state['table'] &&
        !state['heading'] &&
        ( // lists are special, to have text after a nested list in the same li
          // the outer list has to be loose in markdown, so do the reverse here (p wrap)
          !state['list'] ||
          brs > 1 ||
          ['ul', 'ol'].includes(result[result.length - 1]?.['tagName'])
        )
      )
        result.push({
          type: 'element',
          tagName: 'p',
          children: para_
        } as any)
      else result.push(...para_)

      para = []
      brs = 0
    }

    /** Incr/decr counters of block levels */
    function update_state(increment: boolean) {
      if (node['tagName'] === 'table')
        increment ? state['table']++ : state['table']--
      else if (['ul', 'ol'].includes(node['tagName']))
        increment ? state['list']++ : state['list']--
      else if(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node['tagName']))
        increment ? state['heading']++ : state['heading']--
    }
  }
}


/** Mutate hast generated from markdown/mdast before conversion to HTML */
function from_markdown(hast: Node, cfg: Configuration) {
  const br = {type: 'element', tagName: 'br'}
  mutate(hast, {
    table_nl: cfg.options[NEWLINE],
    table: 0,
    list: 0,
    headless: 0
  })

  function mutate(node: Node, state: {}) {
    if (!node['children']?.length) return node
    update_state(true)

    // Mutate children
    const result: Node[] = []
    let prv // preceding child or undef

    // Direct children
    let i = -1
    for (const child of node['children']) {
      i++
      // discard null child and "html prettify newlines"
      if (!child || !child.position && child.type === 'text' && child['value'] === '\n') {
        continue
      }
      const tag = child['tagName']

      // phrasing
      if (phrasing(child)) {
        if (state['table'] && child.type === 'text' && child.value.includes(state['table_nl'])) {
          const txts = child.value.split(new RegExp(`(?<!\\\\)[${state['table_nl']}]`))
          let n = 0
          for (const txt of txts) {
            if (txt) result.push({type: 'text', value: txt} as any)
            if (n++ < txts.length - 1) result.push(br)
          }
        } else {
          // replace i/b with em/strong
          if (tag === 'em') child['tagName'] = 'i'
          else if (tag === 'strong') child['tagName'] = 'b'

          result.push(mutate(child, state))
        }
      }
      
      // blocks
      else {
        // paragraph, preced with <br><br> as needed
        if (tag === 'p') {
          if (prv && (prv['tagName'] === 'p' || prv.type === 'text'))
            result.push(br, br)
          result.push(...mutate(child, state)['children'])
        }

        // Fix headless tables
        else if (state['headless']) {
          // Move thead rows to tbody, they will be handled there
          if (tag === 'thead') {
            let n = i + 1
            while (node['children'][n]['tagName'] !== 'tbody') n++
            node['children'][n]['children'].unshift(...child['children'])
          } else {
            // Convert any th to td
            if (tag === 'th') child['tagName'] = 'td'
            result.push(mutate(child, state))
          }
        }
        
        // non-para, push to result
        else {
          result.push(mutate(child, state))
        }
      }

      prv = child
    }

    node['children'] = result
    // ugly here but clear table headless property
    if (node['tagName'] === 'table' && node['properties']['headless'])
      delete node['properties']['headless']
    update_state(false)
    return node

    /** Incr/decr counters of block levels */
    function update_state(increment: boolean) {
      if (node['tagName'] === 'table') {
        increment ? state['table']++ : state['table']--
        if (node['properties']['headless'])
          increment ? state['headless']++ : state['headless']--
      }
      else if (['ul', 'ol'].includes(node['tagName']))
        increment ? state['list']++ : state['list']--
      else if(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node['tagName']))
        increment ? state['heading']++ : state['heading']--
    }
  }
}

export {from_html, from_markdown}
