import { list as hastToMdastList } from 'hast-util-to-mdast/lib/handlers/list';
import { list as mdastToHastList } from 'mdast-util-to-hast/lib/handlers/list';
function set_spread(state, list) {
    var _a, _b;
    const mdast = hastToMdastList(state, list);
    mdast.spread || (mdast.spread = ((_b = (_a = list.properties) === null || _a === void 0 ? void 0 : _a.className) === null || _b === void 0 ? void 0 : _b.includes('markdown-loose')) || false);
    return mdast;
}
// Add correct class
function add_class(state, list) {
    var _a;
    const spread = list.spread || ((_a = list.children) === null || _a === void 0 ? void 0 : _a.some(li => li.spread));
    const hast = mdastToHastList(state, list);
    hast.properties.className = spread ? 'markdown-loose' : 'markdown-tight';
    return hast;
}
const hastToMdastListType = {
    ul: set_spread,
    ol: set_spread
};
const mdastToHastListType = {
    list: add_class
};
export { hastToMdastListType, mdastToHastListType };
