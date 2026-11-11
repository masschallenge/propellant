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
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  compareVersions,
  createLinkRewriter,
  pageForPath,
  rewriteMarkdown,
  toStarlightPage,
} from './lib/doc-links.mjs';
import {
  BRAND_KIT_FOLDERS,
  BRAND_KIT_NAME,
  colorsJson,
  colorsText,
  isFontFile,
  isLogoFile,
  isPropellantMarkFile,
  readmeText,
} from './lib/brand-kit.mjs';
import {
  OFFICE_TEMPLATES,
  conversionArguments,
  previewCacheKey,
  previewName,
  previewSource,
  templateFiles,
} from './lib/office-templates.mjs';
import { PLATFORMS } from './lib/platforms.mjs';
import {
  SKILL_LOGOS,
  SKILL_NAME,
  SKILL_TEMPLATES,
  artifactStylesheet,
} from './lib/skill-package.mjs';

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
  return { platform: platform.id, ref, pages, checkout };
};

const packageSkill = (checkouts) => {
  const archive = join(projectRoot, 'public/downloads', `${SKILL_NAME}.zip`);
  rmSync(archive, { force: true });
  if (!checkouts.web || !checkouts.office) return false;
  const staging = mkdtempSync(join(tmpdir(), 'propellant-skill-'));
  const skillRoot = join(staging, SKILL_NAME);
  cpSync(join(projectRoot, 'skill', SKILL_NAME), skillRoot, { recursive: true });
  mkdirSync(join(skillRoot, 'assets/templates'), { recursive: true });
  mkdirSync(join(skillRoot, 'assets/logos'), { recursive: true });
  SKILL_TEMPLATES.forEach((template) =>
    cpSync(
      join(checkouts.office, template),
      join(skillRoot, 'assets/templates', basename(template)),
    ),
  );
  SKILL_LOGOS.forEach((logo) =>
    cpSync(join(checkouts.web, 'assets/logos', logo), join(skillRoot, 'assets/logos', logo)),
  );
  const websiteCss = readFileSync(join(checkouts.web, 'dist/website.css'), 'utf8');
  writeFileSync(join(skillRoot, 'assets/propellant-website.css'), artifactStylesheet(websiteCss));
  mkdirSync(dirname(archive), { recursive: true });
  execFileSync('zip', ['-q', '-r', '-X', archive, SKILL_NAME], { cwd: staging });
  rmSync(staging, { recursive: true, force: true });
  return true;
};

const renderPreview = (template, officeCheckout, output) => {
  const source = join(officeCheckout, template.preview);
  const cacheFolder = join(projectRoot, 'node_modules/.cache/propellant-template-previews');
  const cached = join(cacheFolder, `${previewCacheKey(readFileSync(source))}.png`);
  if (!existsSync(cached)) {
    const working = mkdtempSync(join(tmpdir(), 'propellant-preview-'));
    try {
      execFileSync(
        'soffice',
        conversionArguments(source, join(working, 'out'), join(working, 'profile')),
        { stdio: 'ignore' },
      );
      mkdirSync(cacheFolder, { recursive: true });
      cpSync(join(working, 'out', previewName(template)), cached);
    } catch {
      return false;
    } finally {
      rmSync(working, { recursive: true, force: true });
    }
  }
  cpSync(cached, output);
  return true;
};

const publishTemplates = (officeCheckout) => {
  const target = join(projectRoot, 'public/downloads/templates');
  rmSync(target, { recursive: true, force: true });
  if (!officeCheckout) return null;
  mkdirSync(join(target, 'previews'), { recursive: true });
  templateFiles().forEach((path) =>
    cpSync(join(officeCheckout, path), join(target, basename(path))),
  );
  const previews = OFFICE_TEMPLATES.map((template) => {
    const output = join(target, 'previews', previewName(template));
    const published = join(officeCheckout, previewSource(template));
    if (existsSync(published)) {
      cpSync(published, output);
      return 'published';
    }
    return renderPreview(template, officeCheckout, output) ? 'rendered' : 'missing';
  });
  return previews;
};

const publishLogos = (webCheckout) => {
  const target = join(projectRoot, 'public/downloads/logos');
  rmSync(target, { recursive: true, force: true });
  if (!webCheckout) return 0;
  mkdirSync(target, { recursive: true });
  const logos = readdirSync(join(webCheckout, 'assets/logos')).filter(isLogoFile);
  logos.forEach((name) => cpSync(join(webCheckout, 'assets/logos', name), join(target, name)));
  return logos.length;
};

const packageBrandKit = (webCheckout) => {
  const archive = join(projectRoot, 'public/downloads', `${BRAND_KIT_NAME}.zip`);
  rmSync(archive, { force: true });
  if (!webCheckout) return false;
  const staging = mkdtempSync(join(tmpdir(), 'propellant-kit-'));
  const kitRoot = join(staging, BRAND_KIT_NAME);
  const copyMatching = (sourceFolder, matches, folder) => {
    mkdirSync(join(kitRoot, folder), { recursive: true });
    readdirSync(sourceFolder)
      .filter(matches)
      .sort()
      .forEach((name) => cpSync(join(sourceFolder, name), join(kitRoot, folder, name)));
  };
  copyMatching(join(webCheckout, 'assets/logos'), isLogoFile, BRAND_KIT_FOLDERS.logos);
  copyMatching(
    join(webCheckout, 'assets/brand'),
    isPropellantMarkFile,
    BRAND_KIT_FOLDERS.designSystem,
  );
  copyMatching(join(webCheckout, 'assets/fonts'), isFontFile, BRAND_KIT_FOLDERS.fonts);
  const colors = JSON.parse(readFileSync(join(projectRoot, 'src/brand/colors.json'), 'utf8'));
  writeFileSync(join(kitRoot, 'colors.txt'), colorsText(colors));
  writeFileSync(join(kitRoot, 'colors.json'), colorsJson(colors));
  writeFileSync(join(kitRoot, 'README.txt'), readmeText());
  mkdirSync(dirname(archive), { recursive: true });
  execFileSync('zip', ['-q', '-r', '-X', archive, BRAND_KIT_NAME], { cwd: staging });
  rmSync(staging, { recursive: true, force: true });
  return true;
};

const results = PLATFORMS.map(syncPlatform);
results.forEach(({ platform, ref, pages }) =>
  console.log(
    ref
      ? `Synced ${pages.length} ${platform} pages from ${ref}`
      : `Skipped ${platform}: no release yet`,
  ),
);
const checkouts = Object.fromEntries(
  results.filter(({ checkout }) => checkout).map(({ platform, checkout }) => [platform, checkout]),
);
console.log(
  packageSkill(checkouts)
    ? `Packaged the ${SKILL_NAME} skill for download`
    : `Skipped the ${SKILL_NAME} skill: it needs releases of the web and office platforms`,
);
console.log(`Published ${publishLogos(checkouts.web)} logo files for email signatures`);
const previews = publishTemplates(checkouts.office);
console.log(
  previews
    ? `Published the office templates, previews: ${previews.join(', ')}`
    : 'Skipped the office templates: they need a release of the office platform',
);
console.log(
  packageBrandKit(checkouts.web)
    ? `Packaged the ${BRAND_KIT_NAME} for download`
    : `Skipped the ${BRAND_KIT_NAME}: it needs a release of the web platform`,
);
Object.values(checkouts).forEach((checkout) => rmSync(checkout, { recursive: true, force: true }));
