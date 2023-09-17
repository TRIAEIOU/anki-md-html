/**
 * Tighten headings
 */
import type {Node} from 'hast'
import type {State as MdastState} from 'mdast-util-to-hast'

const tightenHeadings = (level: number) => (left: Node, right: Node, parent: Node, state: MdastState)
: number|boolean|undefined =>
{
    // Remove blank line after headings of `level` and above 
    if (left.type === `heading` && left['depth'] >= level)
        return 0
    // undefined → default action
}

export {tightenHeadings}