import { media } from 'hast-util-to-mdast/lib/handlers/media';
/**
 * Micromark HTML extension implementation to convert inline media (audio/video)
 * directive to HTML
 * @param {Directive} d
 * @returns
 */
function mdastToHtml(d) {
    if (d.type !== 'textDirective'
        || !d.label
        || !['audio', 'video'].includes(d.name))
        return false;
    const id = (d.label.match(/^_?(.*?)\..*$/) || [])[1];
    if (!id)
        return false;
    let attribs = "";
    if (d.attributes) {
        if ('auto_front' in d.attributes)
            attribs += 'auto_front ';
        if ('auto_back' in d.attributes)
            attribs += 'auto_back ';
        if ('loop' in d.attributes)
            attribs += 'loop ';
        if ('mute' in d.attributes)
            attribs += 'mute ';
        if (d.name === 'video') {
            if ('height' in d.attributes && parseInt(d.attributes.height) > -1)
                attribs += `height="${d.attributes.height}" `;
            if ('width' in d.attributes && parseInt(d.attributes.width) > -1)
                attribs += `width="${d.attributes.width}" `;
        }
    }
    // @ts-ignore
    this.tag(`<${d.name} id="${id}" class="inline-media" src="${(d === null || d === void 0 ? void 0 : d.label) || ''}" controls ${attribs}oncanplay="if(this.getRootNode().querySelector('anki-editable') === null && this.offsetParent !== null && ((this.hasAttribute('auto_front') && !document.body.classList.contains('back')) || (this.hasAttribute('auto_back') && document.body.classList.contains('back')))) {this.play();}" oncontextmenu="pycmd(this.id); return true;"></${d.name}>`);
    return true;
}
/**
 * Micromark HTML extension implementation to convert inline media (audio/video)
 * directive to HTML, spread in directiveHtml({}) in micromark htmlExtensions
 * @returns
 */
const inlineMediaHtml = {
    audio: mdastToHtml,
    video: mdastToHtml
};
/**
 * Convert inline media (audio/video) hast node to mdast
 */
function hastToMdast(state, node) {
    var _a, _b;
    if (!((_a = node === null || node === void 0 ? void 0 : node.properties) === null || _a === void 0 ? void 0 : _a.className.includes('inline-media')))
        return media(state, node);
    const props = {};
    if ('auto_front' in node.properties && node.properties.auto_front !== 'false')
        props['auto_front'] = '';
    if ('auto_back' in node.properties && node.properties.auto_back !== 'false')
        props['auto_back'] = '';
    if ((_b = node.properties) === null || _b === void 0 ? void 0 : _b.loop)
        props['loop'] = '';
    if ('mute' in node.properties && node.properties.mute !== 'false')
        props['mute'] = '';
    if (node.tagName === 'video') {
        if ('height' in node.properties && parseInt(node.properties.height) > -1)
            props['height'] = node.properties.height;
        if ('width' in node.properties && parseInt(node.properties.width) > -1)
            props['width'] = node.properties.width;
    }
    const result = {
        type: 'textDirective',
        name: node.tagName,
        attributes: props,
        children: [{ type: 'text', value: node.properties.src }]
    };
    state.patch(node, result);
    return result;
}
/**
 * Convert inline media (audio/video) mdast node to hast
 */
function mdastToHast(state, node) {
    if (!(node.name === 'audio' || node.name === 'video'))
        return state.all(node);
    const parts = node.children[0].value.match(/^_(.*)\.([^.]+)$/);
    const properties = {
        id: parts[1],
        src: parts[0],
        className: 'inline-media',
        controls: 'true',
        ...node.attributes,
        oncanplay: "if(this.getRootNode().querySelector('anki-editable') === null && this.offsetParent !== null && ((this.hasAttribute('auto_front') && !document.body.classList.contains('back')) || (this.hasAttribute('auto_back') && document.body.classList.contains('back')))) {this.play();}",
        oncontextmenu: "pycmd(this.id); return true;"
    };
    if ('loop' in properties)
        properties.loop = 'true';
    const result = {
        type: 'element',
        tagName: node.name,
        properties: properties,
        children: []
    };
    state.patch(node, result);
    return result;
}
/**
 * hast handler for converting inline media (audio/video) directives
 * to mdast node, spread in toMdast handlers
 */
const inlineMediaHastHandler = {
    audio: hastToMdast,
    video: hastToMdast
};
/**
 * mdast handler for converting inline media (audio/video) directives
 * to hast node, spread in toHast handlers
 */
const inlineMediaMdastHandler = {
    textDirective: mdastToHast
};
export { inlineMediaHtml, inlineMediaHastHandler, inlineMediaMdastHandler };
