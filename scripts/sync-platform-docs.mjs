import { execFileSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  compareVersions,
  createLinkRewriter,
  pageForPath,
  rewriteMarkdown,
  toStarlightPage,
} from './lib/doc-links.mjs';
import { WEB_DOC_PAGES, WEB_DOC_PATTERNS, WEB_REPOSITORY } from './lib/platforms.mjs';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentRoot = join(projectRoot, 'src/content/docs');

const latestReleaseTag = (repository) => {
  const listing = execFileSync(
    'git',
    ['ls-remote', '--tags', '--refs', `https://github.com/${repository}.git`],
    {
      encoding: 'utf8',
    },
  );
  const tags = listing
    .split('\n')
    .map((line) => line.split('refs/tags/')[1])
    .filter((tag) => tag && /^v\d+\.\d+\.\d+$/.test(tag));
  if (!tags.length) throw new Error(`${repository} has no release tags`);
  return tags.sort(compareVersions).at(-1);
};

const cloneAtRef = (repository, ref) => {
  const checkout = mkdtempSync(join(tmpdir(), 'propellant-'));
  execFileSync(
    'git',
    [
      '-c',
      'advice.detachedHead=false',
      'clone',
      '--quiet',
      '--depth',
      '1',
      '--branch',
      ref,
      `https://github.com/${repository}.git`,
      checkout,
    ],
    {
      stdio: 'inherit',
    },
  );
  return checkout;
};

const markdownFiles = (directory, root = directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(entryPath, root);
    return entry.name.endsWith('.md') ? [relative(root, entryPath)] : [];
  });

const writePage = (page, contents) => {
  const pageFile = join(contentRoot, page);
  mkdirSync(dirname(pageFile), { recursive: true });
  writeFileSync(pageFile, contents);
};

const syncWeb = () => {
  const ref = process.env.PROPELLANT_WEB_REF || latestReleaseTag(WEB_REPOSITORY);
  const checkout = cloneAtRef(WEB_REPOSITORY, ref);
  const rewriter = createLinkRewriter({
    repository: WEB_REPOSITORY,
    ref,
    pages: WEB_DOC_PAGES,
    patterns: WEB_DOC_PATTERNS,
  });
  const sources = [
    'README.md',
    ...markdownFiles(join(checkout, 'docs')).map((path) => `docs/${path}`),
  ];

  rmSync(join(contentRoot, 'web'), { recursive: true, force: true });
  rmSync(join(contentRoot, 'brand'), { recursive: true, force: true });
  rmSync(join(contentRoot, 'guidelines/images.md'), { force: true });

  const synced = sources.flatMap((source) => {
    const page = pageForPath(source, WEB_DOC_PAGES, WEB_DOC_PATTERNS);
    if (page === null) return [];
    const markdown = readFileSync(join(checkout, source), 'utf8');
    const contents = toStarlightPage(rewriteMarkdown(markdown, source, rewriter), {
      editUrl: `https://github.com/${WEB_REPOSITORY}/edit/main/${source}`,
      sourceLabel: `${WEB_REPOSITORY}/${source}`,
    });
    writePage(page, contents);
    return [page];
  });

  mkdirSync(join(projectRoot, 'public/fonts'), { recursive: true });
  readdirSync(join(checkout, 'assets/fonts'))
    .filter((name) => name.endsWith('.woff2'))
    .forEach((name) =>
      cpSync(join(checkout, 'assets/fonts', name), join(projectRoot, 'public/fonts', name)),
    );
  cpSync(join(checkout, 'assets/brand'), join(projectRoot, 'src/assets/brand'), {
    recursive: true,
  });
  cpSync(
    join(checkout, 'assets/brand/propellant-icon.svg'),
    join(projectRoot, 'public/favicon.svg'),
  );

  rmSync(checkout, { recursive: true, force: true });
  return { platform: 'web', ref, pages: synced };
};

const { ref, pages } = syncWeb();
console.log(`Synced ${pages.length} web pages from ${WEB_REPOSITORY} ${ref}`);
