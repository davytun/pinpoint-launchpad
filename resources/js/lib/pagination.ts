/**
 * Laravel paginator labels may contain presentation markup such as
 * `<span>&laquo;</span> Previous`. Render the equivalent text instead of
 * injecting the label as HTML.
 */
export function paginationLabel(label: string): string {
    const entities: Record<string, string> = {
        amp: '&',
        laquo: '«',
        nbsp: ' ',
        quot: '"',
        raquo: '»',
    };

    return label
        .replace(/<[^>]*>/g, '')
        .replace(/&(#39|amp|laquo|nbsp|quot|raquo);/gi, (entity, name: string) =>
            name === '#39' ? "'" : entities[name.toLowerCase()] ?? entity,
        );
}
