import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
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
import { PLATFORMS } from './lib/platforms.mjs';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentRoot = join(projectRoot, 'src/content/docs');

const releaseTags = (source) => {
  try {
    const listing = execFileSync('git', ['ls-remote', '--tags', '--refs', source], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return listing
      .split('\n')
      .map((line) => line.split('refs/tags/')[1])
      .filter((tag) => tag && /^v\d+\.\d+\.\d+$/.test(tag));
  } catch {
    return [];
  }
};

const environmentSetting = (platform, setting) =>
  process.env[`PROPELLANT_${platform.id.toUpperCase()}_${setting}`];

const sourceFor = (platform) =>
  environmentSetting(platform, 'SOURCE') || `https://github.com/${platform.repository}.git`;

const resolveRef = (platform) => {
  const override = environmentSetting(platform, 'REF');
  if (override) return override;
  const tags = releaseTags(sourceFor(platform));
  if (tags.length) return tags.sort(compareVersions).at(-1);
  if (platform.isRequired) throw new Error(`${platform.repository} has no release tags`);
  return null;
};

const cloneAtRef = (source, ref) => {
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
      source,
      checkout,
    ],
    { stdio: 'inherit' },
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

const removeSyncedPages = (platform) =>
  Object.values(platform.pages).forEach((page) => rmSync(join(contentRoot, page), { force: true }));

const copyBrandAssets = (checkout) => {
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
};

const syncPlatform = (platform) => {
  removeSyncedPages(platform);
  rmSync(join(contentRoot, platform.id), { recursive: true, force: true });
  const ref = resolveRef(platform);
  if (ref === null) return { platform: platform.id, ref: null, pages: [] };
  const checkout = cloneAtRef(sourceFor(platform), ref);
  const rewriter = createLinkRewriter({
    platform,
    ref,
    platforms: PLATFORMS,
    hasPage: (page) => existsSync(join(contentRoot, page)),
  });
  const docsDirectory = join(checkout, 'docs');
  const sources = [
    'README.md',
    ...(existsSync(docsDirectory)
      ? markdownFiles(docsDirectory).map((path) => `docs/${path}`)
      : []),
  ];
  const pages = sources.flatMap((source) => {
    const page = pageForPath(source, platform.pages, platform.patterns);
    if (page === null) return [];
    const markdown = readFileSync(join(checkout, source), 'utf8');
    const contents = toStarlightPage(rewriteMarkdown(markdown, source, rewriter), {
      editUrl: `https://github.com/${platform.repository}/edit/main/${source}`,
      sourceLabel: `${platform.repository}/${source}`,
    });
    writePage(page, contents);
    return [page];
  });
  if (platform.providesBrandAssets) copyBrandAssets(checkout);
  rmSync(checkout, { recursive: true, force: true });
  return { platform: platform.id, ref, pages };
};

PLATFORMS.map(syncPlatform).forEach(({ platform, ref, pages }) =>
  console.log(
    ref
      ? `Synced ${pages.length} ${platform} pages from ${ref}`
      : `Skipped ${platform}: no release yet`,
  ),
);
