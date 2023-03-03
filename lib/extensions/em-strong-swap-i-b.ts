/**
 * Convert `mdast` `emphasis` and `strong` nodes to `hast` `i` and `b` nodes,
 * pass in `mdast-to-hast` and `hast-to-mdast` `handlers` respectively
 */
const emStrongToIB = {
    emphasis(state, node) {
        const result = {
            type: 'element',
            tagName: 'i',
            properties: {},
            children: state.all(node)
        }
        state.patch(node, result)
        return result
    },
    strong(state, node) {
    const result = {
        type: 'element',
        tagName: 'b',
        properties: {},
        children: state.all(node)
    }
    state.patch(node, result)
    return result
},
}

const iBToEmStrong = {
    i(state, node) { // https://github.com/syntax-tree/hast-util-to-mdast/blob/main/lib/handlers/em.js
        const result = {type: 'emphasis', children: state.all(node)}
        state.patch(node, result)
        return result
    },
    b(state, node) { // https://github.com/syntax-tree/hast-util-to-mdast/blob/main/lib/handlers/strong.js
        const result = {type: 'strong', children: state.all(node)}
        state.patch(node, result)
        return result
    },
}

export {emStrongToIB, iBToEmStrong}