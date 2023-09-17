const tightenHeadings = (level) => (left, right, parent, state) => {
    // Remove blank line after headings of `level` and above 
    if (left.type === `heading` && left['depth'] >= level)
        return 0;
    // undefined → default action
};
export { tightenHeadings };
