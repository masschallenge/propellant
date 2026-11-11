import { describe, expect, it } from 'vitest';
import {
  OFFICE_TEMPLATES,
  OFFICE_THEME,
  conversionArguments,
  downloadUrl,
  fileExtension,
  previewCacheKey,
  previewName,
  previewSource,
  previewUrl,
  templateFiles,
} from '../scripts/lib/office-templates.mjs';
import { SKILL_TEMPLATES } from '../scripts/lib/skill-package.mjs';

describe('the office template catalog', () => {
  it('has a document, a presentation and a workbook', () => {
    expect(OFFICE_TEMPLATES.map((template) => template.id)).toEqual([
      'document',
      'presentation',
      'workbook',
    ]);
  });

  it('previews the same editable files the skill packages', () => {
    expect(OFFICE_TEMPLATES.map((template) => template.preview)).toEqual(SKILL_TEMPLATES);
  });

  it('offers an Office template and a Google Workspace file for each one', () => {
    OFFICE_TEMPLATES.forEach((template) => {
      const extensions = template.files.map((file) => fileExtension(file.path));
      expect(extensions).toHaveLength(2);
      expect(extensions.some((extension) => extension.endsWith('tx'))).toBe(true);
    });
  });

  it('copies every template file and the theme', () => {
    expect(templateFiles()).toHaveLength(7);
    expect(templateFiles()).toContain(OFFICE_THEME.path);
  });
});

describe('preview and download paths', () => {
  const [document] = OFFICE_TEMPLATES;

  it('follows the names the office build writes', () => {
    expect(previewName(document)).toBe('propellant-document.png');
    expect(previewSource(document)).toBe('templates/previews/propellant-document.png');
  });

  it('serves files flat under the downloads folder', () => {
    expect(downloadUrl('templates/word/propellant-document.dotx')).toBe(
      '/downloads/templates/propellant-document.dotx',
    );
    expect(previewUrl(document)).toBe('/downloads/templates/previews/propellant-document.png');
  });
});

describe('rendering a preview', () => {
  it('converts to PNG headlessly with a private profile', () => {
    const argumentsList = conversionArguments('/in/a.docx', '/out', '/profile');
    expect(argumentsList[0]).toBe('-env:UserInstallation=file:///profile');
    expect(argumentsList).toContain('--headless');
    expect(argumentsList.slice(-4)).toEqual(['png', '--outdir', '/out', '/in/a.docx']);
  });

  it('caches by the contents of the template', () => {
    expect(previewCacheKey('one')).toBe(previewCacheKey('one'));
    expect(previewCacheKey('one')).not.toBe(previewCacheKey('two'));
  });
});
