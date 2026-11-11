import { describe, expect, it } from 'vitest';
import {
  EMAIL_FONT_STACK,
  EMPTY_SIGNATURE,
  SIGNATURE_LOGOS,
  SIGNATURE_OFFICES,
  cleanFields,
  escapeHtml,
  fixBrandSpelling,
  linkHref,
  logoUrl,
  phoneHref,
  sentenceCase,
  signatureHtml,
  signatureNotes,
  signatureText,
} from '../../src/brand/signature';

const person = {
  ...EMPTY_SIGNATURE,
  name: 'Alex Rivera',
  pronouns: 'they/them',
  title: 'Program manager',
  team: 'Programs',
  phone: '+1 617 555 0100',
  email: 'alex@example.org',
  link: 'masschallenge.org',
};

describe('escaping', () => {
  it('escapes every character that could break out of HTML', () => {
    expect(escapeHtml(`<script>"a" & 'b'</script>`)).toBe(
      '&lt;script&gt;&quot;a&quot; &amp; &#39;b&#39;&lt;/script&gt;',
    );
  });

  it('never lets user input through as markup', () => {
    const html = signatureHtml({
      ...person,
      name: '<img src=x onerror=alert(1)>',
      title: '"><script>alert(1)</script>',
      link: 'javascript:alert(1)',
    });
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('href="javascript');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
});

describe('brand rules', () => {
  it('spells MassChallenge correctly and drops em and en dashes', () => {
    expect(fixBrandSpelling('Mass Challenge')).toBe('MassChallenge');
    expect(fixBrandSpelling('masschallenge Boston')).toBe('MassChallenge Boston');
    expect(fixBrandSpelling('Director \u2014 Programs')).toBe('Director, Programs');
    expect(fixBrandSpelling('Programs\u2013Boston')).toBe('Programs, Boston');
  });

  it('suggests sentence case and keeps acronyms and MassChallenge', () => {
    expect(sentenceCase('Senior Program Manager')).toBe('Senior program manager');
    expect(sentenceCase('HEAD OF PROGRAMS')).toBe('Head of programs');
    expect(sentenceCase('CEO')).toBe('CEO');
    expect(sentenceCase('MASSCHALLENGE TEAM')).toBe('MassChallenge team');
    expect(sentenceCase('MassChallenge Switzerland lead')).toBe('MassChallenge switzerland lead');
  });

  it('flags title case and all caps titles with a fix', () => {
    const notes = signatureNotes({ ...person, title: 'Senior Program Manager' });
    expect(notes).toContainEqual({
      field: 'title',
      message: 'Use sentence case: "Senior program manager".',
      suggestion: 'Senior program manager',
    });
    expect(signatureNotes(person)).toEqual([]);
  });

  it('asks for the required fields and checks the contact details', () => {
    const fields = signatureNotes(EMPTY_SIGNATURE).map((note) => note.field);
    expect(fields).toEqual(['name', 'title', 'email']);
    const problems = signatureNotes({ ...person, email: 'alex', phone: '12', link: 'nope' });
    expect(problems.map((note) => note.field).sort()).toEqual(['email', 'link', 'phone']);
  });

  it('trims and cleans every field', () => {
    expect(cleanFields({ ...person, name: '  Alex  ' }).name).toBe('Alex');
  });
});

describe('links', () => {
  it('builds safe links', () => {
    expect(phoneHref('+1 (617) 555-0100')).toBe('tel:+16175550100');
    expect(phoneHref('12')).toBeNull();
    expect(linkHref('masschallenge.org')).toBe('https://masschallenge.org/');
    expect(linkHref('http://example.org/a')).toBe('http://example.org/a');
    expect(linkHref('javascript:alert(1)')).toBeNull();
    expect(linkHref('nope')).toBeNull();
  });
});

describe('the email HTML', () => {
  const html = signatureHtml(person);

  it('is table based with inline styles and no classes or style blocks', () => {
    expect(html.startsWith('<table role="presentation"')).toBe(true);
    expect(html).not.toMatch(/class=|<style|<div/);
    expect(html).toContain(`font-family:${EMAIL_FONT_STACK}`);
  });

  it('loads the logo from an absolute URL on the Propellant site with its size set', () => {
    expect(logoUrl('horizontal')).toBe(
      'https://propellant.masschallenge.org/downloads/logos/masschallenge-logo-horizontal-color.png',
    );
    expect(html).toContain(`src="${logoUrl('horizontal')}"`);
    expect(html).toContain('alt="MassChallenge"');
    expect(signatureHtml(person, 'http://localhost:4321')).toContain(
      'src="http://localhost:4321/downloads/logos/',
    );
    const monogram = signatureHtml({ ...person, logo: 'monogram' });
    expect(monogram).toContain(SIGNATURE_LOGOS.monogram.file);
    expect(monogram).toContain(`width="${SIGNATURE_LOGOS.monogram.width}"`);
  });

  it('keeps the logo on white with clear space of half its height', () => {
    expect(html).toContain(`padding:${SIGNATURE_LOGOS.horizontal.height / 2}px;`);
    expect(html).toContain('bgcolor="#FFFFFF"');
  });

  it('includes every filled in field and leaves out empty ones', () => {
    ['Alex Rivera', '(they/them)', 'Program manager, Programs', 'mailto:alex@example.org'].forEach(
      (part) => expect(html).toContain(part),
    );
    const minimal = signatureHtml({ ...person, pronouns: '', team: '', phone: '', link: '' });
    expect(minimal).not.toContain('tel:');
    expect(minimal).not.toContain('()');
  });

  it('never contains em or en dashes', () => {
    expect(signatureHtml({ ...person, title: 'Lead \u2014 programs' })).not.toMatch(
      /[\u2013\u2014]/,
    );
  });
});

describe('the plain text version', () => {
  it('lists the same details one per line', () => {
    expect(signatureText(person)).toBe(
      [
        'Alex Rivera (they/them)',
        'Program manager, Programs',
        '+1 617 555 0100',
        'alex@example.org',
        'masschallenge.org',
        'MassChallenge',
      ].join('\n'),
    );
  });
});

describe('office address and social links', () => {
  it('leaves both out by default', () => {
    expect(EMPTY_SIGNATURE.office).toBe('none');
    expect(EMPTY_SIGNATURE.showSocial).toBe(false);
    const html = signatureHtml(person);
    expect(html).not.toContain('Fan Pier');
    expect(html).not.toContain('linkedin.com');
  });

  it('offers every office from the About page', () => {
    expect(SIGNATURE_OFFICES.map((office) => office.id)).toEqual([
      'none',
      'boston',
      'dallas',
      'israel',
      'switzerland',
      'united-kingdom',
    ]);
  });

  it('adds the chosen office address', () => {
    const fields = { ...person, office: 'boston' as const };
    expect(signatureHtml(fields)).toContain('10 Fan Pier Blvd, 3rd Floor, Boston, MA 02210 USA');
    expect(signatureText(fields)).toContain('10 Fan Pier Blvd, 3rd Floor, Boston, MA 02210 USA');
  });

  it('adds the official social links when asked', () => {
    const fields = { ...person, showSocial: true };
    const html = signatureHtml(fields);
    expect(html).toContain('href="https://www.linkedin.com/company/masschallenge"');
    expect(html).toContain('href="https://www.instagram.com/masschallenge/"');
    expect(html).toContain('href="https://x.com/MassChallenge"');
    expect(signatureText(fields)).toContain('X: https://x.com/MassChallenge');
  });
});
