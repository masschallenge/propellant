import { describe, expect, it } from 'vitest';
import {
  brandFacts,
  docsPath,
  groupPages,
  guideFromMarkdown,
  llmsFull,
  llmsIndex,
  robotsText,
  type LlmsSite,
} from '../../src/brand/llms';
import { APPROVED_FIGURES, PRIMARY_LINE } from '../../src/brand/messaging';
import { BRAND_COLORS } from '../../src/brand/palette';

const site: LlmsSite = {
  origin: 'https://propellant.masschallenge.org',
  guides: [{ title: 'Voice', body: 'Lead with the point.' }],
  skillPath: '/downloads/propellant-brand.zip',
  pages: [
    { path: '/brand/', title: 'Visual brand guide', description: 'The whole brand.' },
    { path: '/about/', title: 'About Propellant', body: '## How it is organized\n\nOne system.' },
    {
      path: '/web/usage/',
      title: 'Using Propellant',
      body: "import Card from './Card.astro';\n\nInstall the package.",
    },
    { path: '/office/', title: 'Propellant for Office', body: 'Templates.' },
  ],
};

describe('the LLM files', () => {
  it('turns docs entry ids into site paths', () => {
    expect(docsPath('about')).toBe('/about/');
    expect(docsPath('web/websites/index')).toBe('/web/websites/');
    expect(docsPath('index')).toBe('/');
  });

  it('groups pages by area and puts everything else under Optional', () => {
    expect(groupPages(site.pages).map((group) => group.title)).toEqual([
      'Brand',
      'Web',
      'Office',
      'Optional',
    ]);
  });

  it('opens llms.txt with what Propellant is and how to use it', () => {
    const index = llmsIndex(site);
    expect(
      index.startsWith('# Propellant\n\n> Propellant is the MassChallenge design system'),
    ).toBe(true);
    expect(index).toContain('source of truth');
    expect(index).toContain('https://propellant.masschallenge.org/llms-full.txt');
    expect(index).toContain('https://propellant.masschallenge.org/downloads/propellant-brand.zip');
    expect(index).toContain('https://masschallenge.org/');
    expect(index).toContain(
      '- [Visual brand guide](https://propellant.masschallenge.org/brand/): The whole brand.',
    );
  });

  it('leaves out the skill link when the skill is not built', () => {
    expect(llmsIndex({ ...site, skillPath: undefined })).not.toContain('propellant-brand.zip');
  });

  it('puts the brand facts and every page body in llms-full.txt', () => {
    const full = llmsFull(site);
    expect(full).toContain(brandFacts());
    expect(full).toContain(
      '# About Propellant\n\nSource: https://propellant.masschallenge.org/about/',
    );
    expect(full).toContain('## How it is organized');
    expect(full).toContain('Install the package.');
    expect(full).not.toContain('import Card');
    expect(full).not.toContain('# Visual brand guide');
  });

  it('reads a skill reference into a guide', () => {
    expect(guideFromMarkdown('# Voice\n\nLead with the point.\n')).toEqual({
      title: 'Voice',
      body: 'Lead with the point.',
    });
  });

  it('puts the guides for making things on brand in llms-full.txt', () => {
    expect(llmsFull(site)).toContain('# Making things on brand: Voice\n\nLead with the point.');
    expect(llmsIndex(site)).toContain('rules for making documents, decks, graphics, web pages');
    expect(llmsIndex(site)).not.toContain('whole site');
  });

  it('states the brand facts from the same data the site shows', () => {
    const facts = brandFacts();
    expect(facts).toContain(PRIMARY_LINE);
    APPROVED_FIGURES.forEach((figure) => expect(facts).toContain(figure.value));
    BRAND_COLORS.forEach((color) => expect(facts).toContain(color.hex));
    expect(facts).not.toMatch(/\bas of\b/i);
    expect(facts).not.toMatch(/[–—]/);
  });

  it('lets every crawler in and points to the sitemap', () => {
    expect(robotsText('https://propellant.masschallenge.org')).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://propellant.masschallenge.org/sitemap-index.xml\n',
    );
  });
});
