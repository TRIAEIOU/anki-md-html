import { list as hastToMdastList } from 'hast-util-to-mdast/lib/handlers/list';
import { list as mdastToHastList } from 'mdast-util-to-hast/lib/handlers/list';
function set_spread(state, list, type) {
    var _a, _b;
    const mdast = hastToMdastList(state, list);
    mdast.spread = type === 'auto'
        ? mdast.spread || ((_b = (_a = list.properties) === null || _a === void 0 ? void 0 : _a.className) === null || _b === void 0 ? void 0 : _b.includes('markdown-loose')) || false
        : type === 'loose';
    return mdast;
}
// Add correct class
function add_class(state, list, type) {
    var _a;
    const spread = type === 'auto'
        ? list.spread || ((_a = list.children) === null || _a === void 0 ? void 0 : _a.some(li => li.spread))
        : type === 'loose';
    const hast = mdastToHastList(state, list);
    hast.properties.className = spread ? 'markdown-loose' : 'markdown-tight';
    return hast;
}
const hastToMdastListType = (type) => {
    return {
        ul: (state, list) => { return set_spread(state, list, type); },
        ol: (state, list) => { return set_spread(state, list, type); }
    };
};
const mdastToHastListType = (type) => {
    return {
        list: (state, list) => { return add_class(state, list, type); }
    };
};
export { hastToMdastListType, mdastToHastListType };
