import { createHash } from 'node:crypto';
import { basename } from 'node:path';

export const TEMPLATE_DOWNLOADS = '/downloads/templates';
export const PREVIEW_FOLDER = 'templates/previews';

export const OFFICE_TEMPLATES = [
  {
    id: 'document',
    name: 'Document',
    app: 'Word',
    guide: '/office/word/',
    preview: 'templates/word/propellant-document.docx',
    files: [
      {
        label: 'Word template',
        app: 'Microsoft Word',
        path: 'templates/word/propellant-document.dotx',
      },
      {
        label: 'Document for Google Docs',
        app: 'Google Docs',
        path: 'templates/word/propellant-document.docx',
      },
    ],
  },
  {
    id: 'presentation',
    name: 'Presentation',
    app: 'PowerPoint',
    guide: '/office/powerpoint/',
    preview: 'templates/powerpoint/propellant-presentation.pptx',
    files: [
      {
        label: 'PowerPoint template',
        app: 'Microsoft PowerPoint',
        path: 'templates/powerpoint/propellant-presentation.potx',
      },
      {
        label: 'Presentation for Google Slides',
        app: 'Google Slides',
        path: 'templates/powerpoint/propellant-presentation.pptx',
      },
    ],
  },
  {
    id: 'workbook',
    name: 'Workbook',
    app: 'Excel',
    guide: '/office/excel/',
    preview: 'templates/excel/propellant-workbook.xlsx',
    files: [
      {
        label: 'Excel template',
        app: 'Microsoft Excel',
        path: 'templates/excel/propellant-workbook.xltx',
      },
      {
        label: 'Workbook for Google Sheets',
        app: 'Google Sheets',
        path: 'templates/excel/propellant-workbook.xlsx',
      },
    ],
  },
];

export const OFFICE_THEME = {
  label: 'Propellant theme',
  app: 'Any Office file',
  path: 'templates/powerpoint/Propellant.thmx',
};

export const templateFiles = () => [
  ...OFFICE_TEMPLATES.flatMap((template) => template.files.map((file) => file.path)),
  OFFICE_THEME.path,
];

export const previewName = (template) => basename(template.preview).replace(/\.[a-z]+$/, '.png');

export const previewSource = (template) => `${PREVIEW_FOLDER}/${previewName(template)}`;

export const downloadUrl = (path) => `${TEMPLATE_DOWNLOADS}/${basename(path)}`;

export const previewUrl = (template) => `${TEMPLATE_DOWNLOADS}/previews/${previewName(template)}`;

export const fileExtension = (path) => basename(path).split('.').pop();

export const conversionArguments = (source, outputFolder, profileFolder) => [
  `-env:UserInstallation=file://${profileFolder}`,
  '--headless',
  '--norestore',
  '--convert-to',
  'png',
  '--outdir',
  outputFolder,
  source,
];

export const previewCacheKey = (contents) =>
  createHash('sha256').update(contents).digest('hex').slice(0, 32);
