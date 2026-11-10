export const resolveRepositoryPath = (fromDocument, target) => {
  const segments = fromDocument.split('/').slice(0, -1);
  target.split('/').forEach((segment) => {
    if (segment === '..') segments.pop();
    else if (segment !== '.' && segment !== '') segments.push(segment);
  });
  return segments.join('/');
};

export const pageForPath = (path, pages, patterns) => {
  if (pages[path] !== undefined) return pages[path];
  for (const { pattern, page } of patterns) {
    const match = path.match(pattern);
    if (match) return page(match);
  }
  return null;
};

export const routeForPage = (page) =>
  `/${page.replace(/(^|\/)index\.md$/, '').replace(/\.md$/, '')}/`.replace('//', '/');

const isAbsolute = (href) => /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//');

export const createLinkRewriter = ({ repository, ref, pages, patterns }) => {
  const rewriteLink = (fromDocument, href) => {
    if (isAbsolute(href) || href.startsWith('#')) return href;
    const [target, anchor] = href.split('#');
    const path = resolveRepositoryPath(fromDocument, target);
    const page = pageForPath(path, pages, patterns);
    const suffix = anchor ? `#${anchor}` : '';
    if (page !== null) return `${routeForPage(page)}${suffix}`;
    return `https://github.com/${repository}/blob/${ref}/${path}${suffix}`;
  };

  const rewriteAsset = (fromDocument, src) => {
    if (isAbsolute(src)) return src;
    const path = resolveRepositoryPath(fromDocument, src);
    return `https://cdn.jsdelivr.net/gh/${repository}@${ref}/${path}`;
  };

  return { rewriteLink, rewriteAsset };
};

const MARKDOWN_IMAGE = /!\[([^\]]*)\]\(([^)\s]+)([^)]*)\)/g;
const MARKDOWN_LINK = /(?<!!)\[([^\]]*)\]\(([^)\s]+)([^)]*)\)/g;
const HTML_SOURCE = /\b(src|srcset)="([^"]+)"/g;

const outsideCodeFences = (markdown, transform) =>
  markdown
    .split(/(^```[\s\S]*?^```)/m)
    .map((chunk) => (chunk.startsWith('```') ? chunk : transform(chunk)))
    .join('');

export const rewriteMarkdown = (markdown, fromDocument, rewriter) =>
  outsideCodeFences(markdown, (chunk) =>
    chunk
      .replace(
        MARKDOWN_IMAGE,
        (_match, alt, src, rest) => `![${alt}](${rewriter.rewriteAsset(fromDocument, src)}${rest})`,
      )
      .replace(
        MARKDOWN_LINK,
        (_match, text, href, rest) =>
          `[${text}](${rewriter.rewriteLink(fromDocument, href)}${rest})`,
      )
      .replace(
        HTML_SOURCE,
        (_match, attribute, value) =>
          `${attribute}="${rewriter.rewriteAsset(fromDocument, value)}"`,
      ),
  );

const escapeYaml = (text) => JSON.stringify(text);

export const toStarlightPage = (markdown, { editUrl, sourceLabel }) => {
  const withoutPicture = markdown.replace(/^\s*<picture>[\s\S]*?<\/picture>\s*/, '');
  const headingMatch = withoutPicture.match(/^#\s+(.+)$/m);
  if (!headingMatch) throw new Error(`No title heading found (${sourceLabel})`);
  const title = headingMatch[1].trim();
  const body = withoutPicture.replace(headingMatch[0], '').trimStart();
  const frontmatter = [
    '---',
    `title: ${escapeYaml(title)}`,
    `editUrl: ${escapeYaml(editUrl)}`,
    '---',
  ];
  return `${frontmatter.join('\n')}\n\n${body}`;
};

export const compareVersions = (left, right) => {
  const leftParts = left.replace(/^v/, '').split('.').map(Number);
  const rightParts = right.replace(/^v/, '').split('.').map(Number);
  for (const index of [0, 1, 2]) {
    if (leftParts[index] !== rightParts[index]) return leftParts[index] - rightParts[index];
  }
  return 0;
};
