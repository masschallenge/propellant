import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection } from 'astro:content';
import { SKILL_NAME } from '../../scripts/lib/skill-package.mjs';
import { docsPath, type LlmsPage, type LlmsSite } from './llms';

const SITE_PAGES: LlmsPage[] = [
  {
    path: '/brand/',
    title: 'Visual brand guide',
    description: 'The logo, color, type, photography, voice and messaging, with examples.',
  },
  {
    path: '/studio/',
    title: 'Content studio',
    description: 'Make an on brand social post or graphic from your words and a photo.',
  },
  {
    path: '/studio/signature/',
    title: 'Email signature',
    description: 'Build a MassChallenge email signature for Outlook, Gmail and Apple Mail.',
  },
];

const skillPath = `/downloads/${SKILL_NAME}.zip`;

export const llmsSite = async (site: URL | undefined): Promise<LlmsSite> => {
  if (!site) throw new Error('Set site in astro.config.mjs to publish the LLM files');
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
    origin: site.origin,
    pages: [...SITE_PAGES, ...docPages],
    skillPath: existsSync(join(process.cwd(), 'public', skillPath)) ? skillPath : undefined,
  };
};

export const textResponse = (text: string): Response =>
  new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
