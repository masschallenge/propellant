import { OFFICES, SOCIAL_LINKS, officeAddress, type OfficeId } from './contact';
import { findColor } from './palette';

export type SignatureLogo = 'horizontal' | 'monogram';

export type SignatureOffice = OfficeId | 'none';

export interface SignatureFields {
  name: string;
  pronouns: string;
  title: string;
  team: string;
  phone: string;
  email: string;
  link: string;
  logo: SignatureLogo;
  office: SignatureOffice;
  showSocial: boolean;
}

export interface SignatureNote {
  field: keyof SignatureFields;
  message: string;
  suggestion?: string;
}

export const SITE_ORIGIN = 'https://propellant.masschallenge.org';

export const EMAIL_FONT_STACK = 'Lato, Arial, Helvetica, sans-serif';

export const SIGNATURE_LOGOS: Record<
  SignatureLogo,
  { label: string; file: string; width: number; height: number }
> = {
  horizontal: {
    label: 'Horizontal',
    file: 'masschallenge-logo-horizontal-color.png',
    width: 208,
    height: 28,
  },
  monogram: {
    label: 'Monogram',
    file: 'masschallenge-logo-monogram-color.png',
    width: 58,
    height: 32,
  },
};

export const EMPTY_SIGNATURE: SignatureFields = {
  name: '',
  pronouns: '',
  title: '',
  team: '',
  phone: '',
  email: '',
  link: '',
  logo: 'horizontal',
  office: 'none',
  showSocial: false,
};

export const SIGNATURE_OFFICES: { id: SignatureOffice; label: string }[] = [
  { id: 'none', label: 'No office address' },
  ...OFFICES.map((office) => ({ id: office.id, label: office.name })),
];

const officeLine = (office: SignatureOffice): string =>
  office === 'none' ? '' : officeAddress(office);

const INK = findColor('ink').hex;
const SLATE = findColor('slate').hex;
const TEAL = findColor('teal').hex;
const WHITE = findColor('white').hex;

export const logoUrl = (logo: SignatureLogo, origin = SITE_ORIGIN) =>
  `${origin}/downloads/logos/${SIGNATURE_LOGOS[logo].file}`;

export const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const fixBrandSpelling = (text: string) =>
  text.replace(/\bmass[\s-]*challenge\b/gi, 'MassChallenge').replace(/\s*[\u2013\u2014]\s*/g, ', ');

export const cleanFields = (fields: SignatureFields): SignatureFields => ({
  ...fields,
  name: fixBrandSpelling(fields.name.trim()),
  pronouns: fixBrandSpelling(fields.pronouns.trim()),
  title: fixBrandSpelling(fields.title.trim()),
  team: fixBrandSpelling(fields.team.trim()),
  phone: fields.phone.trim(),
  email: fields.email.trim(),
  link: fields.link.trim(),
});

const KEEP_AS_WRITTEN = /^(MassChallenge|[A-Z0-9&]{2,5}|[A-Z][a-z]*[A-Z]\w*)$/;

const isAllCaps = (text: string) => /[A-Z]{2}/.test(text) && text === text.toUpperCase();

export const sentenceCase = (text: string) => {
  const isShouting = isAllCaps(text) && /\s/.test(text.trim());
  const cased = text
    .split(/(\s+)/)
    .map((word, index) => {
      if (/^\s+$/.test(word) || (!isShouting && KEEP_AS_WRITTEN.test(word))) return word;
      const lower = word.toLowerCase();
      return index === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
    })
    .join('');
  return fixBrandSpelling(cased);
};

export const isValidEmail = (email: string) => /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(email);

export const phoneHref = (phone: string) => {
  const digits = phone.replace(/[^\d+]/g, '');
  return digits.replace(/\D/g, '').length >= 7 ? `tel:${digits}` : null;
};

export const linkHref = (link: string) => {
  const candidate = /^https?:\/\//i.test(link) ? link : `https://${link}`;
  try {
    const url = new URL(candidate);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) return null;
    return url.href;
  } catch {
    return null;
  }
};

export const signatureNotes = (fields: SignatureFields): SignatureNote[] => {
  const cleaned = cleanFields(fields);
  const notes: SignatureNote[] = [];
  (['name', 'title', 'email'] as const).forEach((field) => {
    if (!cleaned[field]) notes.push({ field, message: 'Add this to finish your signature.' });
  });
  (['title', 'team'] as const).forEach((field) => {
    const value = cleaned[field];
    const suggestion = sentenceCase(value);
    if (value && (isAllCaps(value) || suggestion !== value)) {
      notes.push({
        field,
        message: `Use sentence case: "${suggestion}".`,
        suggestion,
      });
    }
  });
  if (cleaned.email && !isValidEmail(cleaned.email)) {
    notes.push({ field: 'email', message: 'Check the email address.' });
  }
  if (cleaned.phone && !phoneHref(cleaned.phone)) {
    notes.push({ field: 'phone', message: 'Check the phone number.' });
  }
  if (cleaned.link && !linkHref(cleaned.link)) {
    notes.push({ field: 'link', message: 'Use a web address, such as masschallenge.org.' });
  }
  return notes;
};

const textStyle = (size: number, line: number, color: string, weight = 'normal') =>
  `font-family:${EMAIL_FONT_STACK};font-size:${size}px;line-height:${line}px;color:${color};font-weight:${weight};`;

const row = (content: string, style: string, paddingBottom = 0) =>
  `<tr><td style="${style}padding:0 0 ${paddingBottom}px 0;">${content}</td></tr>`;

const anchor = (href: string, text: string) =>
  `<a href="${escapeHtml(href)}" style="color:${TEAL};text-decoration:underline;">${escapeHtml(text)}</a>`;

export const signatureHtml = (fields: SignatureFields, origin = SITE_ORIGIN): string => {
  const cleaned = cleanFields(fields);
  const logo = SIGNATURE_LOGOS[cleaned.logo];
  const clearSpace = Math.round(logo.height / 2);
  const rows: string[] = [];
  const nameLine = [
    escapeHtml(cleaned.name || 'Your name'),
    cleaned.pronouns
      ? ` <span style="${textStyle(14, 22, SLATE)}">(${escapeHtml(cleaned.pronouns)})</span>`
      : '',
  ].join('');
  rows.push(row(nameLine, textStyle(16, 22, INK, 'bold'), 2));
  const roleLine = [cleaned.title, cleaned.team].filter(Boolean).map(escapeHtml).join(', ');
  if (roleLine) rows.push(row(roleLine, textStyle(14, 20, SLATE), 8));
  const phone = cleaned.phone ? phoneHref(cleaned.phone) : null;
  if (cleaned.phone) {
    rows.push(
      row(phone ? anchor(phone, cleaned.phone) : escapeHtml(cleaned.phone), textStyle(14, 20, INK)),
    );
  }
  if (cleaned.email) {
    const content = isValidEmail(cleaned.email)
      ? anchor(`mailto:${cleaned.email}`, cleaned.email)
      : escapeHtml(cleaned.email);
    rows.push(row(content, textStyle(14, 20, INK)));
  }
  const link = cleaned.link ? linkHref(cleaned.link) : null;
  if (cleaned.link) {
    rows.push(
      row(link ? anchor(link, cleaned.link) : escapeHtml(cleaned.link), textStyle(14, 20, INK)),
    );
  }
  const address = officeLine(cleaned.office);
  if (address) rows.push(row(escapeHtml(address), textStyle(13, 20, SLATE)));
  if (cleaned.showSocial) {
    const socialLinks = SOCIAL_LINKS.map((social) => anchor(social.url, social.name)).join(
      `<span style="color:${SLATE};">&nbsp;&nbsp;|&nbsp;&nbsp;</span>`,
    );
    rows.push(row(socialLinks, textStyle(13, 20, INK)));
  }
  const logoCell =
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">` +
    `<tr><td bgcolor="${WHITE}" style="background-color:${WHITE};padding:${clearSpace}px;">` +
    `<img src="${logoUrl(cleaned.logo, origin)}" width="${logo.width}" height="${logo.height}" alt="MassChallenge" ` +
    `style="display:block;border:0;outline:none;text-decoration:none;width:${logo.width}px;height:${logo.height}px;" />` +
    `</td></tr></table>`;
  rows.push(
    `<tr><td style="padding:${Math.max(0, 12 - clearSpace)}px 0 0 0;">${logoCell}</td></tr>`,
  );
  return (
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" ` +
    `style="border-collapse:collapse;font-family:${EMAIL_FONT_STACK};">` +
    rows.join('') +
    `</table>`
  );
};

export const signatureText = (fields: SignatureFields): string => {
  const cleaned = cleanFields(fields);
  return [
    [cleaned.name || 'Your name', cleaned.pronouns ? `(${cleaned.pronouns})` : '']
      .filter(Boolean)
      .join(' '),
    [cleaned.title, cleaned.team].filter(Boolean).join(', '),
    cleaned.phone,
    cleaned.email,
    cleaned.link,
    officeLine(cleaned.office),
    ...(cleaned.showSocial ? SOCIAL_LINKS.map((social) => `${social.name}: ${social.url}`) : []),
    'MassChallenge',
  ]
    .filter(Boolean)
    .join('\n');
};
