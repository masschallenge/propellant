import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection } from 'astro:content';
import { SKILL_NAME, readVersions, stampVersions } from '../../scripts/lib/skill-package.mjs';
import { docsPath, guideFromMarkdown, type LlmsSite } from './llms';
import { SITE_PAGES } from './site-pages';

const skillPath = `/downloads/${SKILL_NAME}.zip`;

const SKILL_REFERENCES = join(process.cwd(), 'skill', SKILL_NAME, 'references');

const skillGuides = () => {
  const versions = readVersions(process.cwd());
  return readdirSync(SKILL_REFERENCES)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) =>
      guideFromMarkdown(
        stampVersions(readFileSync(join(SKILL_REFERENCES, name), 'utf8'), versions),
      ),
    );
};

export const requireSite = (site: URL | undefined): URL => {
  if (!site)
    throw new Error('Set site in astro.config.mjs to publish robots.txt and the LLM files');
  return site;
};

export const llmsSite = async (site: URL | undefined): Promise<LlmsSite> => {
  const { origin } = requireSite(site);
  const docs = await getCollection('docs');
  const docPages = docs
    .map((entry) => ({
      path: docsPath(entry.id),
      title: entry.data.title,
      description: entry.data.description,
      body: entry.body,
    }))
    .sort((first, second) => first.path.localeCompare(second.path));
  return {
    origin,
    pages: [...SITE_PAGES, ...docPages],
    guides: skillGuides(),
    skillPath: existsSync(join(process.cwd(), 'public', skillPath)) ? skillPath : undefined,
  };
};

export const textResponse = (text: string): Response =>
  new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
