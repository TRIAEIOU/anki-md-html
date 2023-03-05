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

import type {Configuration} from "./constants"
import {EXTENSIONS, NEWLINE} from "./constants"
import type {Node} from "hast"
import {phrasing} from "hast-util-phrasing"

/** Mutate hast generated from HTML before conversion to mdast/markdown */
function from_html(hast: Node, cfg: Configuration) {
  mutate(hast, {
    table_nl: cfg.options['table_nl'],
    table: 0,
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

      // non-phrasing
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
    table: 0
  })

  function mutate(node: Node, state: {}) {
    const result: Node[] = []
    if (node['tagName'] === 'table') state['table']++

    // Mutate children
    if (node['children']) {
      let paragraph = false // previous was paragraph, <br><br> may be needed

      // Direct children
      for (const child of node['children']) {
        const tag = child['tagName']

        // discard "HTML pretty newlines"
        if (!child.position && child.type === 'text' && child['value'] === '\n') {
          continue
        }
        // we have a pending paragraph separation, insert only if phrasing/new p
        else if (paragraph) {
          if (phrasing(child) || tag === 'p') result.push(br,br)
          paragraph = undefined
        }

        /////////////////////////// new if-else block

        // replace newlines in table cells
        if (state['table'] && child.type === 'text' && child.value.includes(state['table_nl'])) {
          let i = 0
          const txts = child.value.split(new RegExp(`(?<!\\\\)[${state['table_nl']}]`))
          for (const txt of txts) {
            if (txt) result.push({type: 'text', value: txt} as any)
            if (i++ < txts.length - 1) result.push(br)
          }
        }
        
        // replace i/b with em/strong
        else if (tag === 'em') {
          child['tagName'] = 'i'
          result.push(mutate(child, state))
        } else if (tag === 'strong') {
          child['tagName'] = 'b'
          result.push(mutate(child, state))
        }

        // replace <p> with <br><br>, actual brs input depending on next block
        else if (tag === 'p') {
          result.push(...mutate(child, state)['children'])
          paragraph = true
        }

        // push non-managed
        else {
          result.push(mutate(child, state))
        }
      }

      node['children'] = result
    }
    if (node['tagName'] === 'table') state['table']--
    return node
  }
}

export {from_html, from_markdown}
