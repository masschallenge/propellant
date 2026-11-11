import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const baseUrl = process.env.STUDIO_URL ?? 'http://localhost:4321';
const outputDirectory = process.env.STUDIO_OUTPUT ?? path.resolve('studio-e2e-output');
const photoPath = process.env.STUDIO_PHOTO ?? '';

mkdirSync(outputDirectory, { recursive: true });

const pngSize = (buffer) => ({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) });

const makePhoto = () => {
  const width = 400;
  const height = 300;
  const rows = Array.from({ length: height }, (_unused, row) => {
    const line = Buffer.alloc(1 + width * 3);
    for (let column = 0; column < width; column += 1) {
      line[1 + column * 3] = 30 + Math.round((180 * column) / width);
      line[2 + column * 3] = 60 + Math.round((120 * row) / height);
      line[3 + column * 3] = 140;
    }
    return line;
  });
  const chunk = (kind, data) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(kind), data]);
    const checksum = Buffer.alloc(4);
    checksum.writeUInt32BE(zlib.crc32(body) >>> 0);
    return Buffer.concat([length, body, checksum]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 2, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(Buffer.concat(rows))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const results = [];
const check = (name, passed, detail = '') => {
  results.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? `: ${detail}` : ''}`);
};

const toastText = async (page) =>
  (await page.locator('[data-studio-toast]').allInnerTexts()).join(' | ');

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    acceptDownloads: true,
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(`${baseUrl}/studio/?brief=open`, { waitUntil: 'networkidle' });
  const dialog = page.getByRole('dialog', { name: 'What is the post about?' });
  check('1. The studio opens on the brief dialog', await dialog.isVisible());

  await dialog.getByLabel('Small line on top').fill('Boston, June 12');
  await dialog.getByLabel('The big line').fill('Demo day is here');
  await dialog.getByLabel('Details').fill('Meet this year’s startups at the Seaport.');
  await dialog.getByLabel('Call to action or handle').fill('@masschallenge');
  await dialog
    .locator('input[type=file]')
    .setInputFiles(
      photoPath
        ? photoPath
        : { name: 'test-photo.png', mimeType: 'image/png', buffer: makePhoto() },
    );
  await page.waitForTimeout(300);
  check(
    '2. The brief is filled in, with a photo kept in the browser',
    await dialog
      .getByText('test-photo.png')
      .or(dialog.getByText(path.basename(photoPath || 'test-photo.png')))
      .first()
      .isVisible(),
  );

  await dialog.getByRole('button', { name: 'Lay it out' }).click();
  const layoutButtons = dialog.getByRole('button', { name: /^Use layout/ });
  await layoutButtons.first().waitFor();
  const layoutCount = await layoutButtons.count();
  const firstNames = await layoutButtons.evaluateAll((buttons) =>
    buttons.map((button) => button.getAttribute('aria-label')),
  );
  check('3. Lay it out shows about six layouts', layoutCount === 6, `${layoutCount} layouts`);
  await page.screenshot({ path: path.join(outputDirectory, 'layouts.png') });

  await dialog.getByRole('button', { name: 'Shuffle the colors' }).click();
  await page.waitForTimeout(200);
  const shuffledNames = await layoutButtons.evaluateAll((buttons) =>
    buttons.map((button) => button.getAttribute('aria-label')),
  );
  check('3b. Shuffle the colors recolors the layouts', shuffledNames.join() !== firstNames.join());

  const typeOnly = dialog.locator('[data-layout="type-only"]');
  await typeOnly.click();
  await dialog.waitFor({ state: 'hidden' });
  check(
    '4. Picking a layout opens the editor',
    await page.locator('[data-studio-canvas]').isVisible(),
  );
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outputDirectory, 'editor.png') });

  await page.getByRole('button', { name: 'Add body text' }).click();
  const words = page.getByRole('textbox', { name: 'Words' });
  await words.fill("DON'T MISS OUT");
  await page.waitForTimeout(1200);
  const wordsValue = await words.inputValue();
  const caseToast = await toastText(page);
  check(
    '5. All caps body text turns into sentence case, with a toast',
    wordsValue === "Don't miss out" && caseToast.includes('sentence case'),
    `words now "${wordsValue}"; toast "${caseToast}"`,
  );
  const liveRegion = await page.locator('[aria-live="polite"]:has([data-studio-toast])').count();
  check('5b. Toasts sit in an aria-live region', liveRegion === 1);

  await page.getByRole('button', { name: 'Deep teal', exact: true }).click();
  await page.waitForTimeout(400);
  const switchToast = await toastText(page);
  check(
    '6. Changing the background switches the text and says so',
    switchToast.includes('Switched "Don\'t miss out" to White so it reads on that background'),
    switchToast,
  );
  await page.screenshot({ path: path.join(outputDirectory, 'switched.png') });

  const status = await page.locator('[data-brand-status]').first().innerText();
  check('6b. The brand status pill reports', status.length > 0, status);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download PNG' }).click(),
  ]);
  const downloadPath = path.join(outputDirectory, download.suggestedFilename());
  await download.saveAs(downloadPath);
  const size = pngSize(readFileSync(downloadPath));
  check(
    '7. The PNG downloads at the full format size, named from the big line',
    size.width === 1080 &&
      size.height === 1350 &&
      download.suggestedFilename() === 'demo-day-is-here.png',
    `${download.suggestedFilename()} ${size.width}x${size.height}`,
  );

  check('No page errors', errors.length === 0, errors.join(' / '));
  await browser.close();
  const failed = results.filter((result) => !result.passed);
  console.log(`${results.length - failed.length} of ${results.length} checks passed`);
  process.exitCode = failed.length ? 1 : 0;
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
